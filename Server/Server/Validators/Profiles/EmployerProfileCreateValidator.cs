using FluentValidation;
using Server.DTOs.Profiles;

namespace Server.Validators.Profiles
{
    public class EmployerProfileCreateValidator : AbstractValidator<EmployerProfileCreateDto>
    {
        public EmployerProfileCreateValidator()
        {
            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage("Display name is required.")
                .MaximumLength(255).WithMessage("Display name cannot exceed 255 characters.");

            RuleFor(x => x.ContactPhone)
                .MaximumLength(20).WithMessage("Contact phone cannot exceed 20 characters.")
                .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid contact phone format.")
                .When(x => !string.IsNullOrEmpty(x.ContactPhone));

            RuleFor(x => x.Industry)
                .MaximumLength(255).WithMessage("Industry cannot exceed 255 characters.");

            RuleFor(x => x.Position)
                .MaximumLength(255).WithMessage("Position cannot exceed 255 characters.");

            RuleFor(x => x.YearsOfExperience)
                .InclusiveBetween(0, 50).WithMessage("Years of experience must be between 0 and 50.")
                .When(x => x.YearsOfExperience.HasValue);

            RuleFor(x => x.LinkedInProfile)
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid LinkedIn profile URL.");

            RuleFor(x => x.Website)
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid website URL.");
        }
    }
}
