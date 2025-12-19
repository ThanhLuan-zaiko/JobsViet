using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Auth;
using Server.DTOs.Auth;
using Server.Services.Auth;
using Server;
using Server.Models;
using Microsoft.AspNetCore.Http;
using FluentValidation;
using Server.Validators.Auth;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using System.Collections.Generic;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly JwtService _jwtService;
        private readonly JwtBlacklistService _jwtBlacklist;

        public AuthController(IAuthService authService, JwtService jwtService, JwtBlacklistService jwtBlacklist)
        {
            _authService = authService;
            _jwtService = jwtService;
            _jwtBlacklist = jwtBlacklist;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate request using FluentValidation
                var validator = new LoginRequestValidator();
                var validationResult = await validator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return Ok(new AuthResponse
                    {
                        Message = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)),
                        MessageType = "warning"
                    });
                }

                var (user, errorCode) = await _authService.AuthenticateForLoginAsync(request.Email, request.Password);
                
                if (errorCode == "USER_BANNED")
                {
                    return Ok(new AuthResponse
                    {
                        Message = "Tài khoản của bạn đã bị cấm",
                        MessageType = "error"
                    });
                }

                if (user == null)
                {
                    return Ok(new AuthResponse
                    {
                        Message = "Sai tài khoản hoặc mật khẩu",
                        MessageType = "warning"
                    });
                }

                // Regenerate session to prevent session fixation
                await HttpContext.Session.LoadAsync();
                HttpContext.Session.Clear();
                HttpContext.Session.SetString("UserId", user.UserId.ToString());
                HttpContext.Session.SetString("Email", user.Email);
                HttpContext.Session.SetString("Role", user.Role);
                await HttpContext.Session.CommitAsync();

                // Sign in the user for authentication
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Role, user.Role)
                };
                var claimsIdentity = new ClaimsIdentity(claims, "Cookies");
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
                await HttpContext.SignInAsync("Cookies", claimsPrincipal);

                return Ok(new AuthResponse
                {
                    User = new UserDto
                    {
                        UserId = user.UserId.ToString(),
                        Email = user.Email,
                        Role = user.Role
                    },
                    Message = "Đăng nhập thành công",
                    MessageType = "success"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return Ok(new AuthResponse
                {
                    Message = "Lỗi hệ thống, vui lòng thử lại",
                    MessageType = "error"
                });
            }
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate request using FluentValidation
                var validator = new RegisterRequestValidator();
                var validationResult = await validator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return Ok(new AuthResponse
                    {
                        Message = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)),
                        MessageType = "warning"
                    });
                }

                if (await _authService.UserExistsAsync(request.Email))
                {
                    return Ok(new AuthResponse
                    {
                        Message = "Email đã tồn tại, chọn email khác",
                        MessageType = "info"
                    });
                }

                var user = await _authService.RegisterAsync(request.Email, request.Password, "User", request.Name);

                // Store user in session after registration
                await HttpContext.Session.LoadAsync();
                HttpContext.Session.SetString("UserId", user.UserId.ToString());
                HttpContext.Session.SetString("Email", user.Email);
                HttpContext.Session.SetString("Role", user.Role);
                await HttpContext.Session.CommitAsync();

                // Sign in the user for authentication
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Role, user.Role)
                };
                var claimsIdentity = new ClaimsIdentity(claims, "Cookies");
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
                await HttpContext.SignInAsync("Cookies", claimsPrincipal);

                return Ok(new AuthResponse
                {
                    User = new UserDto
                    {
                        UserId = user.UserId.ToString(),
                        Email = user.Email,
                        Role = user.Role
                    },
                    Message = "Đăng ký thành công",
                    MessageType = "success"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return Ok(new AuthResponse
                {
                    Message = "Lỗi hệ thống, vui lòng thử lại",
                    MessageType = "error"
                });
            }
        }

        [HttpGet("me")]
        [AllowAnonymous]
        public IActionResult GetCurrentUser()
        {
            var userId = HttpContext.Session.GetString("UserId");
            var email = HttpContext.Session.GetString("Email");
            var role = HttpContext.Session.GetString("Role");

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(role))
            {
                return Unauthorized(new { Message = "Session expired" });
            }

            return Ok(new UserDto
            {
                UserId = userId,
                Email = email,
                Role = role
            });
        }

        [HttpGet("antiforgery-token")]
        public IActionResult GetAntiforgeryToken([FromServices] Microsoft.AspNetCore.Antiforgery.IAntiforgery antiforgery)
        {
            var tokens = antiforgery.GetAndStoreTokens(HttpContext);
            return Ok(new { token = tokens.RequestToken });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userIdStr = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                {
                    return Ok(new { Message = "Phiên đăng nhập không hợp lệ", MessageType = "error" });
                }

                // Validate request using FluentValidation
                var validator = new ChangePasswordRequestValidator();
                var validationResult = await validator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return Ok(new
                    {
                        Message = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)),
                        MessageType = "warning"
                    });
                }

                var success = await _authService.ChangePasswordAsync(userId, request.OldPassword, request.NewPassword);
                if (!success)
                {
                    return Ok(new { Message = "Mật khẩu cũ không đúng", MessageType = "error" });
                }

                return Ok(new { Message = "Đổi mật khẩu thành công", MessageType = "success" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return Ok(new { Message = "Lỗi hệ thống, vui lòng thử lại", MessageType = "error" });
            }
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout()
        {
            // Sign out the user
            await HttpContext.SignOutAsync("Cookies");

            // Clear session for session-based auth
            HttpContext.Session.Clear();

            // If JWT is used, extract and blacklist token
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                // Blacklist the token
                await _jwtBlacklist.AddToBlacklistAsync(token, TimeSpan.FromHours(1));
            }

            return Ok(new { Message = "Đã đăng xuất thành công" });
        }
    }
}
