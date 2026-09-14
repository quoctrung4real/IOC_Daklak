using Backend.Services;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Middleware;

public class VisitorTrackingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly VisitorTrackingService _trackingService;

    // Các từ khóa để nhận diện bot đơn giản
    private static readonly string[] BotKeywords = { "bot", "crawler", "spider", "slurp", "google", "bing", "yahoo", "baidu" };

    public VisitorTrackingMiddleware(RequestDelegate next, VisitorTrackingService trackingService)
    {
        _next = next;
        _trackingService = trackingService;
    }

    public async Task InvokeAsync(HttpContext context, IPortalDataStore dataStore)
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = context.Request.Headers.UserAgent.ToString().ToLowerInvariant();

        // Phát hiện bot
        var isBot = BotKeywords.Any(k => userAgent.Contains(k));

        // Băm IP và User-Agent để đếm mà không lưu dữ liệu cá nhân
        var visitorId = HashString($"{ip}_{userAgent}");

        // Cập nhật đếm realtime
        _trackingService.UpdateVisitor(visitorId, isBot);

        // Kiểm tra xem đã ghi nhận truy cập trong ngày chưa bằng cookie
        var cookieName = "VisitorRecorded_" + DateTime.UtcNow.ToString("yyyyMMdd");
        if (!context.Request.Cookies.ContainsKey(cookieName))
        {
            try
            {
                // Ghi vào database (hoặc json)
                await dataStore.RecordVisitAsync(isBot, context.RequestAborted);

                // Lưu cookie để không ghi đè liên tục trong ngày
                context.Response.Cookies.Append(cookieName, "1", new CookieOptions
                {
                    Expires = DateTime.UtcNow.AddDays(1),
                    HttpOnly = true,
                    SameSite = SameSiteMode.Lax // Lax để hoạt động trơn tru trong môi trường không strict
                });
            }
            catch
            {
                // Bỏ qua lỗi nếu database có vấn đề để không sập request
            }
        }

        await _next(context);
    }

    private static string HashString(string input)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
