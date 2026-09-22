using System.Diagnostics;
using System.IO.Compression;
using System.Runtime.InteropServices;

namespace Backend.Services;

public class PiperInstallerService
{
    private readonly ILogger<PiperInstallerService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    
    // Piper version 2023.11.14-2
    private const string BasePiperUrl = "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/";
    private const string ModelUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx";
    private const string ModelJsonUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx.json";

    public PiperInstallerService(ILogger<PiperInstallerService> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Kiểm tra và tự động cài đặt Piper + Model nếu chưa tồn tại
    /// Trả về đường dẫn đến tệp thực thi Piper (executable path) và Model Path
    /// </summary>
    public async Task<(string executablePath, string modelPath)> EnsurePiperInstalledAsync(string rootPath)
    {
        var piperDir = Path.Combine(rootPath, "tts_models", "piper");
        Directory.CreateDirectory(piperDir);

        var modelDir = Path.Combine(rootPath, "tts_models");
        var modelPath = Path.Combine(modelDir, "vi_VN-vais1000-medium.onnx");
        var modelJsonPath = Path.Combine(modelDir, "vi_VN-vais1000-medium.onnx.json");

        var isWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
        var isMacOs = RuntimeInformation.IsOSPlatform(OSPlatform.OSX);
        var execName = isWindows ? "piper.exe" : "piper";
        
        string execPath;
        if (isMacOs)
        {
            execPath = Path.Combine(piperDir, "piper_env", "bin", "piper");
        }
        else
        {
            execPath = Path.Combine(piperDir, "piper", execName); // Thư mục giải nén thường chứa một folder piper con
        }

        bool piperExists = File.Exists(execPath);
        bool modelExists = File.Exists(modelPath) && File.Exists(modelJsonPath);

        if (piperExists && modelExists)
        {
            return (execPath, modelPath); // Đã cài đặt đầy đủ
        }

        _logger.LogInformation("Bắt đầu tự động tải và cài đặt Piper TTS đa nền tảng...");

        try
        {
            using var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromMinutes(5);

            // 1. Tải và giải nén Piper Engine nếu thiếu
            if (!piperExists)
            {
                await InstallPiperEngineAsync(client, piperDir, isWindows, isMacOs);
            }

            // 2. Tải Model Tiếng Việt nếu thiếu
            if (!modelExists)
            {
                await InstallModelAsync(client, modelPath, modelJsonPath);
            }

            // Đảm bảo quyền thực thi trên MacOS/Linux
            if (!isWindows && File.Exists(execPath))
            {
                MakeExecutable(execPath);
            }

            _logger.LogInformation("Piper TTS đã được cài đặt thành công tại: {Path}", execPath);
            return (execPath, modelPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tự động cài đặt Piper TTS.");
            return (string.Empty, string.Empty);
        }
    }

    private async Task InstallPiperEngineAsync(HttpClient client, string targetDir, bool isWindows, bool isMacOs)
    {
        if (isMacOs)
        {
            _logger.LogInformation("Cài đặt Piper thông qua Python venv (Giải pháp native cho MacOS)...");
            var venvDir = Path.Combine(targetDir, "piper_env");
            var processInfo = new System.Diagnostics.ProcessStartInfo
            {
                FileName = "/bin/bash",
                Arguments = $"-c \"python3 -m venv {venvDir} && source {venvDir}/bin/activate && pip install piper-tts\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            using var process = System.Diagnostics.Process.Start(processInfo);
            if (process != null)
            {
                await process.WaitForExitAsync();
                if (process.ExitCode != 0)
                {
                    var error = await process.StandardError.ReadToEndAsync();
                    throw new Exception($"Cài đặt piper-tts qua Python thất bại: {error}");
                }
            }
            return;
        }

        var (fileName, isZip) = GetPiperReleaseFileName();
        var downloadUrl = BasePiperUrl + fileName;
        var tempFilePath = Path.Combine(Path.GetTempPath(), fileName);

        _logger.LogInformation("Đang tải Piper Engine từ {Url}...", downloadUrl);
        await DownloadFileAsync(client, downloadUrl, tempFilePath);

        _logger.LogInformation("Đang giải nén {FileName} vào {TargetDir}...", fileName, targetDir);
        if (isZip)
        {
            ZipFile.ExtractToDirectory(tempFilePath, targetDir, overwriteFiles: true);
        }
        else
        {
            ExtractTarGz(tempFilePath, targetDir);
        }

        // Dọn dẹp file nén
        if (File.Exists(tempFilePath))
        {
            File.Delete(tempFilePath);
        }
    }

    private async Task InstallModelAsync(HttpClient client, string modelPath, string modelJsonPath)
    {
        _logger.LogInformation("Đang tải Piper Model Tiếng Việt (ONNX)...");
        await DownloadFileAsync(client, ModelUrl, modelPath);
        
        _logger.LogInformation("Đang tải Piper Model Cấu hình (JSON)...");
        await DownloadFileAsync(client, ModelJsonUrl, modelJsonPath);
    }

    private async Task DownloadFileAsync(HttpClient client, string url, string destination)
    {
        using var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
        response.EnsureSuccessStatusCode();

        using var contentStream = await response.Content.ReadAsStreamAsync();
        using var fileStream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None, 8192, true);
        await contentStream.CopyToAsync(fileStream);
    }

    private void ExtractTarGz(string archivePath, string destinationDirectory)
    {
        // Trên Linux và macOS, lệnh 'tar' luôn có sẵn
        var processStartInfo = new ProcessStartInfo
        {
            FileName = "tar",
            Arguments = $"-xzf \"{archivePath}\" -C \"{destinationDirectory}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(processStartInfo);
        process?.WaitForExit();

        if (process?.ExitCode != 0)
        {
            var error = process?.StandardError.ReadToEnd();
            throw new Exception($"Không thể giải nén file tar.gz. ExitCode: {process?.ExitCode}, Error: {error}");
        }
    }

    private void MakeExecutable(string filePath)
    {
        var processStartInfo = new ProcessStartInfo
        {
            FileName = "chmod",
            Arguments = $"+x \"{filePath}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(processStartInfo);
        process?.WaitForExit();
    }

    private (string fileName, bool isZip) GetPiperReleaseFileName()
    {
        var isWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
        var isMacOS = RuntimeInformation.IsOSPlatform(OSPlatform.OSX);
        var isLinux = RuntimeInformation.IsOSPlatform(OSPlatform.Linux);
        var arch = RuntimeInformation.ProcessArchitecture;

        if (isWindows)
        {
            return ("piper_windows_amd64.zip", true);
        }

        if (isMacOS)
        {
            if (arch == Architecture.Arm64)
                return ("piper_macos_aarch64.tar.gz", false); // Dành cho Apple Silicon (M1/M2/M3)
            else
                return ("piper_macos_x64.tar.gz", false);     // Dành cho Intel Mac
        }

        if (isLinux)
        {
            if (arch == Architecture.Arm64)
                return ("piper_linux_aarch64.tar.gz", false);
            else if (arch == Architecture.Arm)
                return ("piper_linux_armv7.tar.gz", false);
            else
                return ("piper_linux_x86_64.tar.gz", false);
        }

        throw new PlatformNotSupportedException($"Nền tảng {RuntimeInformation.OSDescription} - {arch} không được Piper hỗ trợ sẵn.");
    }
}
