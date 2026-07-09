const fs = require('fs');
let code = fs.readFileSync('backend/Program.cs', 'utf8');

// Insert paths
code = code.replace(
    'string baoLuPath = Path.Combine(dataDir, "cap-nhat-bao-lu.json");',
    'string baoLuPath = Path.Combine(dataDir, "cap-nhat-bao-lu.json");\nstring usersPath = Path.Combine(dataDir, "users.json");\nstring commentsPath = Path.Combine(dataDir, "binh-luan.json");'
);

code = code.replace(
    'if (!File.Exists(baoLuPath)) File.WriteAllText(baoLuPath, "{\\"title\\":\\"\\",\\"content\\":\\"\\"}");',
    'if (!File.Exists(baoLuPath)) File.WriteAllText(baoLuPath, "{\\"title\\":\\"\\",\\"content\\":\\"\\"}");\nif (!File.Exists(usersPath)) File.WriteAllText(usersPath, "[]");\nif (!File.Exists(commentsPath)) File.WriteAllText(commentsPath, "[]");'
);

// Append APIs and Models at the end before app.Run()
const authAndCommentsAPI = `
// --- USERS & AUTH API ---
app.MapGet("/api/nguoi-dung", async (HttpContext context) =>
{
    var usersJson = await File.ReadAllTextAsync(usersPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(usersJson);
});

app.MapPost("/api/register", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var newUser = JsonSerializer.Deserialize<User>(body);
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson) ?? new List<User>();
    
    if (usersList.Any(u => u.Username == newUser.Username)) {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Tên đăng nhập đã tồn tại." });
        return;
    }
    
    newUser.Id = Guid.NewGuid().ToString();
    newUser.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    usersList.Add(newUser);
    
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, new JsonSerializerOptions { WriteIndented = true }));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đăng ký thành công.", user = new { newUser.Username } });
});

app.MapPost("/api/login", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var loginReq = JsonSerializer.Deserialize<User>(body);
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson) ?? new List<User>();
    
    var user = usersList.FirstOrDefault(u => u.Username == loginReq.Username && u.Password == loginReq.Password);
    if (user == null) {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Sai tên đăng nhập hoặc mật khẩu." });
        return;
    }
    
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đăng nhập thành công.", user = new { user.Username } });
});

// --- COMMENTS API ---
app.MapGet("/api/binh-luan", async (HttpContext context, string pageId) =>
{
    var commentsJson = await File.ReadAllTextAsync(commentsPath);
    var commentsList = JsonSerializer.Deserialize<List<Comment>>(commentsJson) ?? new List<Comment>();
    
    var pageComments = commentsList.Where(c => c.PageId == pageId).ToList();
    
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(JsonSerializer.Serialize(pageComments));
});

app.MapPost("/api/binh-luan", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var newComment = JsonSerializer.Deserialize<Comment>(body);
    
    var commentsJson = await File.ReadAllTextAsync(commentsPath);
    var commentsList = JsonSerializer.Deserialize<List<Comment>>(commentsJson) ?? new List<Comment>();
    
    newComment.Id = Guid.NewGuid().ToString();
    newComment.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    newComment.Likes = 0;
    
    commentsList.Add(newComment);
    
    await File.WriteAllTextAsync(commentsPath, JsonSerializer.Serialize(commentsList, new JsonSerializerOptions { WriteIndented = true }));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đã gửi bình luận.", comment = newComment });
});

app.MapPost("/api/binh-luan/{id}/like", async (HttpContext context, string id) =>
{
    var commentsJson = await File.ReadAllTextAsync(commentsPath);
    var commentsList = JsonSerializer.Deserialize<List<Comment>>(commentsJson) ?? new List<Comment>();
    
    var comment = commentsList.FirstOrDefault(c => c.Id == id);
    if (comment != null) {
        comment.Likes += 1;
        await File.WriteAllTextAsync(commentsPath, JsonSerializer.Serialize(commentsList, new JsonSerializerOptions { WriteIndented = true }));
        await context.Response.WriteAsJsonAsync(new { success = true, likes = comment.Likes });
    } else {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy bình luận." });
    }
});
`;

const models = `
public class User {
    public string Id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string RegisterDate { get; set; }
}

public class Comment {
    public string Id { get; set; }
    public string PageId { get; set; }
    public string Username { get; set; }
    public string Content { get; set; }
    public int Likes { get; set; }
    public string CreatedAt { get; set; }
}
`;

code = code.replace('app.Run();', authAndCommentsAPI + '\napp.Run();\n' + models);

// Add using System.Collections.Generic and System.Linq
if (!code.includes('using System.Collections.Generic;')) {
    code = 'using System.Collections.Generic;\nusing System.Linq;\n' + code;
}

fs.writeFileSync('backend/Program.cs', code);
console.log("Program.cs patched successfully");
