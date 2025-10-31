using FluentValidation;
using Server.DTOs.Profiles;

namespace Server.Validators.Profiles
{
    public class CandidateProfileUpdateValidator : AbstractValidator<CandidateProfileUpdateDto>
    {
        public CandidateProfileUpdateValidator()
        {
            RuleFor(x => x.FullName)
                .MaximumLength(200).WithMessage("Full name cannot exceed 200 characters.")
                .When(x => !string.IsNullOrEmpty(x.FullName));

            RuleFor(x => x.Phone)
                .MaximumLength(50).WithMessage("Phone number cannot exceed 50 characters.")
                .Matches("^\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$").WithMessage("Invalid phone number format.")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.Headline)
                .MaximumLength(300).WithMessage("Headline cannot exceed 300 characters.")
                .When(x => !string.IsNullOrEmpty(x.Headline));

            RuleFor(x => x.DateOfBirth)
                .LessThan(DateTime.Now.AddYears(-16)).WithMessage("Must be at least 16 years old.")
                .When(x => x.DateOfBirth.HasValue);

            RuleFor(x => x.Gender)
                .Must(g => g == null || new[] { "Nam", "Nữ", "Khác" }.Contains(g))
                .WithMessage("Gender must be 'Nam', 'Nữ', or 'Khác'.");

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.Address));

            RuleFor(x => x.EducationLevel)
                .MaximumLength(100).WithMessage("Education level cannot exceed 100 characters.")
                .When(x => !string.IsNullOrEmpty(x.EducationLevel));

            RuleFor(x => x.ExperienceYears)
                .InclusiveBetween(0, 50).WithMessage("Experience years must be between 0 and 50.")
                .When(x => x.ExperienceYears.HasValue);

            RuleFor(x => x.Skills)
                .MaximumLength(2000).WithMessage("Skills cannot exceed 2000 characters.")
                .When(x => !string.IsNullOrEmpty(x.Skills));

            RuleFor(x => x.LinkedInProfile)
                .MaximumLength(300).WithMessage("LinkedIn profile URL cannot exceed 300 characters.")
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid LinkedIn profile URL.");

            RuleFor(x => x.PortfolioURL)
                .MaximumLength(300).WithMessage("Portfolio URL cannot exceed 300 characters.")
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid portfolio URL.");
        }
    }
}
