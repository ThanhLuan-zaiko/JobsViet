using FluentValidation;
using Server.DTOs.Auth;

namespace Server.Validators.Auth
{
    public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
    {
        public ChangePasswordRequestValidator()
        {
            RuleFor(x => x.OldPassword)
                .NotEmpty().WithMessage("Mật khẩu cũ là bắt buộc");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Mật khẩu mới là bắt buộc")
                .MinimumLength(6).WithMessage("Mật khẩu mới phải có ít nhất 6 ký tự")
                .Matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$").WithMessage("Mật khẩu phải có ký tự hoa, thường, đặc biệt và số!")
                .NotEqual(x => x.OldPassword).WithMessage("Mật khẩu mới không được giống mật khẩu cũ");

            RuleFor(x => x.ConfirmNewPassword)
                .NotEmpty().WithMessage("Xác nhận mật khẩu mới là bắt buộc")
                .Equal(x => x.NewPassword).WithMessage("Mật khẩu xác nhận không khớp");
        }
    }
}
