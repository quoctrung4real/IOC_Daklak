using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class AzureTextToSpeechService : ITextToSpeechService
{
    private readonly HttpClient _httpClient;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<AzureTextToSpeechService> _logger;
    private readonly TextToSpeechOptions _options;

    public AzureTextToSpeechService(
        HttpClient httpClient,
        IWebHostEnvironment environment,
        IOptions<TextToSpeechOptions> options,
        ILogger<AzureTextToSpeechService> logger)
    {
        _httpClient = httpClient;
        _environment = environment;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<TextToSpeechResponseDto> SynthesizeAsync(TextToSpeechRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.AzureKey) || string.IsNullOrWhiteSpace(_options.AzureRegion))
        {
            return TextToSpeechResponseDto.Fail("Chua cau hinh Azure Speech key/region.");
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

        var voice = string.IsNullOrWhiteSpace(request.Voice) ? _options.AzureVoice : request.Voice.Trim();
        var outputFormat = string.IsNullOrWhiteSpace(_options.AzureOutputFormat)
            ? "audio-24khz-48kbitrate-mono-mp3"
            : _options.AzureOutputFormat.Trim();
        var hash = CreateHash($"azure|{voice}|{outputFormat}|{text}");

        var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var outputDirectory = Path.Combine(webRootPath, "uploads", "tts");
        Directory.CreateDirectory(outputDirectory);

        var fileName = $"{hash}.mp3";
        var outputPath = Path.Combine(outputDirectory, fileName);
        var audioUrl = $"/uploads/tts/{fileName}";

        if (File.Exists(outputPath))
        {
            return TextToSpeechResponseDto.Ok(audioUrl, voice, text.Length, cached: true);
        }

        var ssml = BuildSsml(text, voice);
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"https://{_options.AzureRegion}.tts.speech.microsoft.com/cognitiveservices/v1");
        httpRequest.Headers.TryAddWithoutValidation("Ocp-Apim-Subscription-Key", _options.AzureKey);
        httpRequest.Headers.TryAddWithoutValidation("X-Microsoft-OutputFormat", outputFormat);
        httpRequest.Headers.TryAddWithoutValidation("User-Agent", "IOC_Daklak_Backend");
        httpRequest.Content = new StringContent(ssml, Encoding.UTF8, "application/ssml+xml");

        try
        {
            using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Azure TTS failed with {StatusCode}: {Error}", response.StatusCode, error);
                return TextToSpeechResponseDto.Fail($"Azure TTS loi: {(int)response.StatusCode}.");
            }

            await using var audioStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            await using var fileStream = new FileStream(outputPath, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            await audioStream.CopyToAsync(fileStream, cancellationToken);

            return TextToSpeechResponseDto.Ok(audioUrl, voice, text.Length, cached: false);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Azure TTS request failed.");
            return TextToSpeechResponseDto.Fail("Khong ket noi duoc Azure TTS.");
        }
    }

    private static string BuildSsml(string text, string voice)
    {
        var escapedText = WebUtility.HtmlEncode(text);
        var escapedVoice = WebUtility.HtmlEncode(voice);
        return $"""
            <speak version="1.0" xml:lang="vi-VN">
                <voice xml:lang="vi-VN" name="{escapedVoice}">
                    {escapedText}
                </voice>
            </speak>
            """;
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
}
