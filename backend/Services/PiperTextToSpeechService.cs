using System.Diagnostics;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class PiperTextToSpeechService : ITextToSpeechService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<PiperTextToSpeechService> _logger;
    private readonly TextToSpeechOptions _options;

    public PiperTextToSpeechService(
        IWebHostEnvironment environment,
        IOptions<TextToSpeechOptions> options,
        ILogger<PiperTextToSpeechService> logger)
    {
        _environment = environment;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<TextToSpeechResponseDto> SynthesizeAsync(TextToSpeechRequestDto request, CancellationToken cancellationToken)
    {
        var executablePath = ResolveExecutablePath();
        if (string.IsNullOrWhiteSpace(executablePath))
        {
            return TextToSpeechResponseDto.Fail("Khong tim thay Piper executable. Kiem tra cau hinh TextToSpeech:ExecutablePath.");
        }

        if (string.IsNullOrWhiteSpace(_options.ModelPath))
        {
             return TextToSpeechResponseDto.Fail("Chua cau hinh Piper ModelPath.");
        }

        var modelPath = _options.ModelPath;
        if (!Path.IsPathRooted(modelPath) && !string.IsNullOrWhiteSpace(modelPath))
        {
            modelPath = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, modelPath));
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
        
        // Include ModelPath in hash to invalidate cache if model changes
        var hash = CreateHash($"{_options.ModelPath}|{voice}|{speed}|{pitch}|{text}");

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

        try
        {
            var isBashScript = executablePath.EndsWith(".sh");
            var startInfo = new ProcessStartInfo
            {
                FileName = isBashScript ? "/bin/bash" : executablePath,
                RedirectStandardError = true,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                StandardInputEncoding = Encoding.UTF8
            };

            if (isBashScript)
            {
                startInfo.ArgumentList.Add(executablePath);
            }

            startInfo.ArgumentList.Add("--model");
            startInfo.ArgumentList.Add(modelPath);
            startInfo.ArgumentList.Add("--output_file");
            startInfo.ArgumentList.Add(outputPath);

            if (speed > 0) 
            {
                // Speed = 150 corresponds to length_scale = 1.45 (much slower than default 1.0 for Vais1000)
                // A lower speed (e.g. 100) will result in a higher length_scale (slower voice)
                double lengthScale = (150.0 / speed) * 1.45;
                startInfo.ArgumentList.Add("--length_scale");
                startInfo.ArgumentList.Add(lengthScale.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture));
            }
            
            // Add silence between sentences to make it clearer and less rushed
            startInfo.ArgumentList.Add("--sentence_silence");
            startInfo.ArgumentList.Add("0.5");
            using var process = Process.Start(startInfo);
            if (process is null)
            {
                return TextToSpeechResponseDto.Fail("Khong khoi dong duoc Piper.");
            }

            // Ghi nội dung vào StandardInput (Piper nhận input từ stdin)
            await process.StandardInput.WriteAsync(text);
            process.StandardInput.Close();

            var exited = await WaitForExitAsync(process, TimeSpan.FromSeconds(_options.TimeoutSeconds), cancellationToken);
            var error = await process.StandardError.ReadToEndAsync(cancellationToken);

            if (!exited)
            {
                TryKill(process);
                return TextToSpeechResponseDto.Fail("Piper xu ly qua thoi gian cho phep.");
            }

            if (process.ExitCode != 0 || !File.Exists(outputPath))
            {
                _logger.LogWarning("Piper failed with code {ExitCode}: {Error}", process.ExitCode, error);
                return TextToSpeechResponseDto.Fail("Piper tao audio that bai.");
            }

            return TextToSpeechResponseDto.Ok(audioUrl, voice, text.Length, cached: false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Loi trong qua trinh goi Piper TTS");
            return TextToSpeechResponseDto.Fail($"Loi thuc thi Piper TTS: {ex.Message}");
        }
    }

    private string? ResolveExecutablePath()
    {
        var path = _options.ExecutablePath;
        if (!string.IsNullOrWhiteSpace(path))
        {
            if (!Path.IsPathRooted(path) && path.Contains('/'))
            {
                return Path.GetFullPath(Path.Combine(_environment.ContentRootPath, path));
            }
            return path;
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
        
        var normalized = decoded;

        // 1. Ký tự đặc biệt
        normalized = Regex.Replace(normalized, @"\s+&\s+", " và ");
        normalized = Regex.Replace(normalized, @"\bUSD\b", "Đô la Mỹ");
        normalized = Regex.Replace(normalized, @"\b\+/-\b", "cộng trừ");

        // 2. Loại bỏ dấu chấm phân cách hàng nghìn (vd: 2.000 -> 2000) để AI đọc đúng "hai ngàn"
        normalized = Regex.Replace(normalized, @"(?<=\b\d+)\.(?=\d{3}\b)", "");
        
        // 3. Khoảng (Range) vd: 6-12 tuổi -> 6 đến 12
        normalized = Regex.Replace(normalized, @"(?<=\b\d+)\s*-\s*(?=\d+\b)", " đến ");

        // 4. Số thập phân (vd: 2,5 -> 2 phẩy 5)
        normalized = Regex.Replace(normalized, @"(?<=\b\d+),(?=\d+\b)", " phẩy ");

        // 5. Chuẩn hóa ngày tháng (vd: 20/11/2023 -> ngày 20 tháng 11 năm 2023)
        normalized = Regex.Replace(normalized, @"\b(\d{1,2})/(\d{1,2})(/(\d{2,4}))?\b", match => 
        {
            var day = match.Groups[1].Value;
            var month = match.Groups[2].Value;
            var year = match.Groups[4].Success ? $" năm {match.Groups[4].Value}" : "";
            return $" ngày {day} tháng {month}{year} ";
        });

        // 6. Giờ giấc (vd: 08h30, 8g30 -> 8 giờ 30 phút, 15h -> 15 giờ)
        normalized = Regex.Replace(normalized, @"\b(\d{1,2})[hg](\d{1,2})\b", "$1 giờ $2 phút", RegexOptions.IgnoreCase);
        normalized = Regex.Replace(normalized, @"\b(\d{1,2})h\b", "$1 giờ", RegexOptions.IgnoreCase);
        
        // 7. Số La Mã (Chỉ chuyển khi đứng sau một số từ khóa như Quý, Khóa, Thế kỷ, Điều, Chương...)
        var romanToNumber = new Dictionary<string, string>
        {
            {"I", "1"}, {"II", "2"}, {"III", "3"}, {"IV", "4"}, {"V", "5"}, 
            {"VI", "6"}, {"VII", "7"}, {"VIII", "8"}, {"IX", "9"}, {"X", "10"},
            {"XI", "11"}, {"XII", "12"}, {"XIII", "13"}, {"XIV", "14"}, {"XV", "15"},
            {"XVI", "16"}, {"XVII", "17"}, {"XVIII", "18"}, {"XIX", "19"}, {"XX", "20"},
            {"XXI", "21"}
        };
        // Lặp qua từng số La Mã từ lớn đến bé để tránh thay thế nhầm (XX trước X)
        foreach (var roman in romanToNumber.OrderByDescending(r => r.Key.Length))
        {
            // Regex: Ký tự La Mã phải đứng độc lập, và có thể đi sau Quý|Khóa|Thế kỷ|Điều|Chương|Kỳ|Đại hội (bắt buộc nhìn ngược lại, có thể cách nhau một từ)
            normalized = Regex.Replace(normalized, $@"(?<=(Quý|Khóa|Thế kỷ|Điều|Chương|Kỳ|Đại hội)\s+)\b{roman.Key}\b", roman.Value, RegexOptions.IgnoreCase);
        }
        
        // 8. Chuẩn hóa đơn vị đo lường phổ biến và ký hiệu (có dấu mũ ³/²)
        var unitRules = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            {@"(\d+)\s*m[³3]/s(?!\w)", "$1 mét khối trên giây "},
            {@"(\d+)\s*m[³3](?!\w)", "$1 mét khối "},
            {@"(\d+)\s*m[²2](?!\w)", "$1 mét vuông "},
            {@"(\d+)\s*km/h\b", "$1 ki lô mét trên giờ "},
            {@"(\d+)\s*km\b", "$1 ki lô mét "},
            {@"(\d+)\s*kg\b", "$1 ki lô gam "},
            {@"(\d+)\s*ha\b", "$1 héc ta "},
            {@"(\d+)\s*cm\b", "$1 xen ti mét "},
            {@"(\d+)\s*mm\b", "$1 mi li mét "},
            {@"(\d+)\s*ml\b", "$1 mi li lít "},
            {@"(\d+)\s*l\b", "$1 lít "},
            {@"(\d+)\s*kWh\b", "$1 ki lô oát giờ "},
            {@"(\d+)\s*kW\b", "$1 ki lô oát "},
            {@"(\d+)\s*MW\b", "$1 mê ga oát "},
            {@"(\d+)\s*°C\b", "$1 độ C "},
            {@"(\d+)\s*(VNĐ|VND|đ)\b", "$1 đồng "}
        };
        foreach (var rule in unitRules)
        {
            normalized = Regex.Replace(normalized, rule.Key, rule.Value);
        }
        normalized = Regex.Replace(normalized, @"%", " phần trăm ");

        // 9. Địa danh Đắk Lắk & Tây Nguyên siêu cấp
        var localNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            {@"\bSêrêpốk\b", "Sê rê pốc"},
            {@"\bSêrêpôk\b", "Sê rê pốc"},
            {@"\bKrông\b", "Cờ rông"},
            {@"\bH'leo\b", "Hờ leo"},
            {@"\bM'Đrắk\b", "Mờ đờ rắc"},
            {@"\bCư M'gar\b", "Cư Mờ ga"},
            {@"\bN'Trang Lơng\b", "Nờ trang lơng"},
            {@"\bY Jút\b", "Y Dút"},
            {@"\bCư Kuin\b", "Cư Cu in"},
            {@"\bLắk\b", "Lắc"},
            {@"\bM'Nông\b", "Mờ nông"},
            {@"\bK'Ho\b", "Cờ ho"},
            {@"\bEa\s+", "E a "} // Ea Kar, Ea Súp, Ea H'leo
        };
        foreach (var name in localNames)
        {
            normalized = Regex.Replace(normalized, name.Key, name.Value);
        }

        // 10. Từ viết tắt phổ biến & Hành chính
        var abbreviations = new Dictionary<string, string>
        {
            {@"\bUBND\b", "Ủy ban nhân dân"},
            {@"\bHĐND\b", "Hội đồng nhân dân"},
            {@"\bTW\b", "Trung ương"},
            {@"\bBCH\b", "Ban chấp hành"},
            {@"\bMTTQ\b", "Mặt trận Tổ quốc"},
            {@"\bTP\b", "Thành phố"},
            {@"\bQĐ-UBND\b", "Quyết định của Ủy ban nhân dân"},
            {@"\bNĐ-CP\b", "Nghị định của Chính phủ"},
            {@"\bCSGT\b", "Cảnh sát giao thông"},
            {@"\bPCCC\b", "Phòng cháy chữa cháy"},
            {@"\bBHXH\b", "Bảo hiểm xã hội"},
            {@"\bBHYT\b", "Bảo hiểm y tế"},
            {@"\bNN&PTNT\b", "Nông nghiệp và Phát triển nông thôn"},
            {@"\bGTVT\b", "Giao thông vận tải"},
            {@"\bGD&ĐT\b", "Giáo dục và Đào tạo"},
            {@"\bGD-ĐT\b", "Giáo dục và Đào tạo"},
            {@"\bBGDĐT\b", "Bộ Giáo dục và Đào tạo"},
            {@"\bKH&ĐT\b", "Kế hoạch và Đầu tư"},
            {@"\bTN&MT\b", "Tài nguyên và Môi trường"},
            {@"\bVH-TT&DL\b", "Văn hóa, Thể thao và Du lịch"},
            {@"\bVHTTDL\b", "Văn hóa, Thể thao và Du lịch"},
            {@"\bTT&TT\b", "Thông tin và Truyền thông"},
            {@"\bTAND\b", "Tòa án nhân dân"},
            {@"\bVKSND\b", "Viện kiểm sát nhân dân"},
            {@"\bHĐQT\b", "Hội đồng quản trị"},
            {@"\bTTgCP\b", "Thủ tướng Chính phủ"},
            {@"\bCA\b", "Công an"}
        };
        foreach (var abbr in abbreviations)
        {
            normalized = Regex.Replace(normalized, abbr.Key, abbr.Value);
        }

        return Regex.Replace(normalized, "\\s+", " ").Trim();
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
}
