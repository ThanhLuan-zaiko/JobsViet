using FluentValidation;
using Server.DTOs.Auth;
using System.Text.RegularExpressions;

namespace Server.Validators.Auth
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên là bắt buộc")
                .MinimumLength(3).WithMessage("Tên phải có ít nhất 3 ký tự")
                .Matches(@"^[a-zA-Z\sÀ-ỹà-ỹ]+$").WithMessage("Tên chỉ được chứa chữ cái và khoảng trắng");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email là bắt buộc")
                .EmailAddress().WithMessage("Định dạng email không hợp lệ")
                .Matches("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$").WithMessage("Mail không hợp lệ!");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu là bắt buộc")
                .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự")
                .Matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$").WithMessage("Mật khẩu phải có ký tự hoa, thường, đặc biệt và số!");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Xác nhận mật khẩu là bắt buộc")
                .Equal(x => x.Password).WithMessage("Mật khẩu xác nhận không khớp");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Vai trò là bắt buộc")
                .Must(role => role == "User" || role == "Moderator" || role == "Admin")
                .WithMessage("Vai trò không hợp lệ");
        }
    }
}
