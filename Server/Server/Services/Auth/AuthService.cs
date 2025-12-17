using Microsoft.EntityFrameworkCore;
using Server.Data.Auth;
using Server.DTOs.Auth;
using Server.Models.Auth;
using System.Security.Cryptography;
using System.Text;

namespace Server.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuthService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<User?> AuthenticateAsync(string email, string password)
        {
            try
            {
                var user = await _unitOfWork.Context.Users
                    .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

                if (user == null)
                {
                    return null;
                }

                if (!VerifyPassword(password, user.PasswordHash))
                {
                    return null;
                }

                return user;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Authentication error for {email}: {ex.Message}");
                return null;
            }
        }

        public async Task<User> RegisterAsync(string email, string password, string role = "User", string? name = null)
        {
            if (await UserExistsAsync(email))
            {
                throw new InvalidOperationException("User already exists");
            }

            var user = new User
            {
                UserId = Guid.NewGuid(),
                UserName = name ?? "",
                Email = email,
                PasswordHash = HashPassword(password),
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _unitOfWork.Context.Users.Add(user);
            await _unitOfWork.SaveChangesAsync();

            return user;
        }

        public Task<User> RegisterAsync(string email, string password, string role = "User")
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UserExistsAsync(string email)
        {
            return await _unitOfWork.Context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword)
        {
            var user = await _unitOfWork.Context.Users.FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive);
            if (user == null)
            {
                return false;
            }

            if (!VerifyPassword(oldPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = HashPassword(newPassword);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private string HashPassword(string password)
        {
            using var pbkdf2 = new Rfc2898DeriveBytes(password, 16, 10000, HashAlgorithmName.SHA256);
            var salt = pbkdf2.Salt;
            var hash = pbkdf2.GetBytes(32);
            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var parts = storedHash.Split(':');
            if (parts.Length != 2) return false;
            var salt = Convert.FromBase64String(parts[0]);
            var storedHashBytes = Convert.FromBase64String(parts[1]);
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(32);
            return computedHash.SequenceEqual(storedHashBytes);
        }
    }
}
