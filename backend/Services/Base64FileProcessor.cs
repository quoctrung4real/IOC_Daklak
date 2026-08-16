using System;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Services
{
    public static class Base64FileProcessor
    {
        private static readonly Regex Base64Regex = new Regex(@"^data:image\/(?<type>[a-zA-Z]+);base64,(?<data>.+)$", RegexOptions.Compiled);

        public static async Task<bool> ProcessJsonNodeAsync(JsonNode? node, string webRootPath)
        {
            if (node == null) return false;
            bool modified = false;

            if (node is JsonObject obj)
            {
                var keys = obj.Select(x => x.Key).ToList();
                foreach (var key in keys)
                {
                    if (obj[key] is JsonValue val && val.TryGetValue<string>(out var strValue))
                    {
                        if (strValue != null && strValue.StartsWith("data:image/"))
                        {
                            var match = Base64Regex.Match(strValue);
                            if (match.Success)
                            {
                                var ext = match.Groups["type"].Value;
                                var base64Data = match.Groups["data"].Value;
                                
                                var fileName = $"{Guid.NewGuid()}.{ext}";
                                var uploadDir = Path.Combine(webRootPath, "uploads");
                                Directory.CreateDirectory(uploadDir);
                                
                                var filePath = Path.Combine(uploadDir, fileName);
                                await File.WriteAllBytesAsync(filePath, Convert.FromBase64String(base64Data));
                                
                                obj[key] = $"/uploads/{fileName}";
                                modified = true;
                            }
                        }
                    }
                    else
                    {
                        if (await ProcessJsonNodeAsync(obj[key], webRootPath))
                        {
                            modified = true;
                        }
                    }
                }
            }
            else if (node is JsonArray arr)
            {
                foreach (var item in arr)
                {
                    if (await ProcessJsonNodeAsync(item, webRootPath))
                    {
                        modified = true;
                    }
                }
            }

            return modified;
        }
    }
}
