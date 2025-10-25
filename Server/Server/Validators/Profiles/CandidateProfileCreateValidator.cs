using FluentValidation;
using Server.DTOs.Profiles;

namespace Server.Validators.Profiles
{
    public class CandidateProfileCreateValidator : AbstractValidator<CandidateProfileCreateDto>
    {
        public CandidateProfileCreateValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(255).WithMessage("Full name cannot exceed 255 characters.");

            RuleFor(x => x.Phone)
                .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters.")
                .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format.")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.Headline)
                .MaximumLength(500).WithMessage("Headline cannot exceed 500 characters.");

            RuleFor(x => x.DateOfBirth)
                .LessThan(DateTime.Now.AddYears(-16)).WithMessage("Must be at least 16 years old.")
                .When(x => x.DateOfBirth.HasValue);

            RuleFor(x => x.Gender)
                .Must(g => g == null || new[] { "Nam", "Nữ", "Khác" }.Contains(g))
                .WithMessage("Gender must be 'Nam', 'Nữ', or 'Khác'.");

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters.");

            RuleFor(x => x.EducationLevel)
                .MaximumLength(100).WithMessage("Education level cannot exceed 100 characters.");

            RuleFor(x => x.ExperienceYears)
                .InclusiveBetween(0, 50).WithMessage("Experience years must be between 0 and 50.")
                .When(x => x.ExperienceYears.HasValue);

            RuleFor(x => x.Skills)
                .MaximumLength(1000).WithMessage("Skills cannot exceed 1000 characters.");

            RuleFor(x => x.LinkedInProfile)
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid LinkedIn profile URL.");

            RuleFor(x => x.PortfolioURL)
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid portfolio URL.");
        }
    }
}
