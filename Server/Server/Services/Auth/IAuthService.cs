using Server.DTOs.Auth;
using Server.Models.Auth;

namespace Server.Services.Auth
{
    public interface IAuthService
    {
        Task<User?> AuthenticateAsync(string email, string password);
        Task<(User? User, string? ErrorCode)> AuthenticateForLoginAsync(string email, string password);
        Task<User> RegisterAsync(string email, string password, string role = "User", string? name = null);
        Task<bool> UserExistsAsync(string email);
        Task<bool> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword);
    }
}
