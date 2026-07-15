using System.Diagnostics;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class EspeakTextToSpeechService : ITextToSpeechService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<EspeakTextToSpeechService> _logger;
    private readonly TextToSpeechOptions _options;

    public EspeakTextToSpeechService(
        IWebHostEnvironment environment,
        IOptions<TextToSpeechOptions> options,
        ILogger<EspeakTextToSpeechService> logger)
    {
        _environment = environment;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<TextToSpeechResponseDto> SynthesizeAsync(TextToSpeechRequestDto request, CancellationToken cancellationToken)
    {
        var executablePath = ResolveExecutablePath();
        if (string.IsNullOrWhiteSpace(executablePath) || !File.Exists(executablePath))
        {
            return TextToSpeechResponseDto.Fail("Khong tim thay eSpeak executable. Kiem tra cau hinh TextToSpeech:ExecutablePath.");
        }

        var text = NormalizeText(request.Text);
        if (string.IsNullOrWhiteSpace(text))
        {
            return TextToSpeechResponseDto.Fail("Noi dung can doc dang trong.");
        }

        if (text.Length > _options.MaxTextLength)
        {
            text = text[.._options.MaxTextLength];
        }

        var voice = string.IsNullOrWhiteSpace(request.Voice) ? _options.Voice : request.Voice.Trim();
        var speed = request.Speed ?? _options.Speed;
        var pitch = request.Pitch ?? _options.Pitch;
        var hash = CreateHash($"{voice}|{speed}|{pitch}|{text}");

        var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var outputDirectory = Path.Combine(webRootPath, "uploads", "tts");
        Directory.CreateDirectory(outputDirectory);

        var fileName = $"{hash}.wav";
        var outputPath = Path.Combine(outputDirectory, fileName);
        var audioUrl = $"/uploads/tts/{fileName}";

        if (File.Exists(outputPath))
        {
            return TextToSpeechResponseDto.Ok(audioUrl, voice, text.Length, cached: true);
        }

        var inputPath = Path.Combine(outputDirectory, $"{hash}.txt");
        await File.WriteAllTextAsync(inputPath, text, Encoding.UTF8, cancellationToken);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = executablePath,
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            startInfo.ArgumentList.Add("-v");
            startInfo.ArgumentList.Add(voice);
            startInfo.ArgumentList.Add("-s");
            startInfo.ArgumentList.Add(speed.ToString());
            startInfo.ArgumentList.Add("-p");
            startInfo.ArgumentList.Add(pitch.ToString());
            startInfo.ArgumentList.Add("-w");
            startInfo.ArgumentList.Add(outputPath);
            startInfo.ArgumentList.Add("-f");
            startInfo.ArgumentList.Add(inputPath);

            using var process = Process.Start(startInfo);
            if (process is null)
            {
                return TextToSpeechResponseDto.Fail("Khong khoi dong duoc eSpeak.");
            }

            var exited = await WaitForExitAsync(process, TimeSpan.FromSeconds(_options.TimeoutSeconds), cancellationToken);
            var error = await process.StandardError.ReadToEndAsync(cancellationToken);

            if (!exited)
            {
                TryKill(process);
                return TextToSpeechResponseDto.Fail("eSpeak xu ly qua thoi gian cho phep.");
            }

            if (process.ExitCode != 0 || !File.Exists(outputPath))
            {
                _logger.LogWarning("eSpeak failed with code {ExitCode}: {Error}", process.ExitCode, error);
                return TextToSpeechResponseDto.Fail("eSpeak tao audio that bai.");
            }

            return TextToSpeechResponseDto.Ok(audioUrl, voice, text.Length, cached: false);
        }
        finally
        {
            TryDelete(inputPath);
        }
    }

    private string? ResolveExecutablePath()
    {
        if (!string.IsNullOrWhiteSpace(_options.ExecutablePath))
        {
            return _options.ExecutablePath;
        }

        return _options.ExecutableName;
    }

    private static string NormalizeText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var withoutScripts = Regex.Replace(value, "<(script|style)[^>]*>.*?</\\1>", " ", RegexOptions.IgnoreCase | RegexOptions.Singleline);
        var withoutTags = Regex.Replace(withoutScripts, "<[^>]+>", " ");
        var decoded = WebUtility.HtmlDecode(withoutTags);
        return Regex.Replace(decoded, "\\s+", " ").Trim();
    }

    private static string CreateHash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static async Task<bool> WaitForExitAsync(Process process, TimeSpan timeout, CancellationToken cancellationToken)
    {
        var waitTask = process.WaitForExitAsync(cancellationToken);
        var timeoutTask = Task.Delay(timeout, cancellationToken);
        return await Task.WhenAny(waitTask, timeoutTask) == waitTask;
    }

    private static void TryKill(Process process)
    {
        try
        {
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
            }
        }
        catch
        {
            // Best effort cleanup.
        }
    }

    private static void TryDelete(string path)
    {
        try
        {
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
        catch
        {
            // Best effort cleanup.
        }
    }
}
