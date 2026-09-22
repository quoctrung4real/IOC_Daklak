using System.Security.Cryptography;

namespace Backend.Services;

public static class PasswordService
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);

        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            HashSize);

        return $"PBKDF2${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool VerifyPassword(string password, string storedValue)
    {
        if (string.IsNullOrWhiteSpace(storedValue))
        {
            return false;
        }

        // Chỉ chấp nhận mật khẩu đã được hash bằng PBKDF2.
        // Không cho phép đăng nhập bằng mật khẩu plaintext.
        if (!storedValue.StartsWith("PBKDF2$", StringComparison.Ordinal))
        {
            return false;
        }

        var parts = storedValue.Split('$');

        if (parts.Length != 4 ||
            !int.TryParse(parts[1], out var iterations))
        {
            return false;
        }

        try
        {
            var salt = Convert.FromBase64String(parts[2]);
            var expectedHash = Convert.FromBase64String(parts[3]);

            var actualHash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                iterations,
                HashAlgorithmName.SHA256,
                expectedHash.Length);

            return CryptographicOperations.FixedTimeEquals(
                actualHash,
                expectedHash);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}