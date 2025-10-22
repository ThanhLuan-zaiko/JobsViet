namespace Server.DTOs.Auth
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
        public UserDto User { get; set; } = new UserDto();
        public string Message { get; set; } = string.Empty;
        public string MessageType { get; set; } = string.Empty; // "success", "warning", "error"
    }

    public class UserDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
