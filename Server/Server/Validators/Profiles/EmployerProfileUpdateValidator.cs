using FluentValidation;
using Server.DTOs.Profiles;

namespace Server.Validators.Profiles
{
    public class EmployerProfileUpdateValidator : AbstractValidator<EmployerProfileUpdateDto>
    {
        public EmployerProfileUpdateValidator()
        {
            RuleFor(x => x.DisplayName)
                .MaximumLength(200).WithMessage("Display name cannot exceed 200 characters.")
                .When(x => !string.IsNullOrEmpty(x.DisplayName));

            RuleFor(x => x.ContactPhone)
                .MaximumLength(50).WithMessage("Phone number cannot exceed 50 characters.")
                .Matches("^\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$").WithMessage("Invalid phone number format.")
                .When(x => !string.IsNullOrEmpty(x.ContactPhone));

            RuleFor(x => x.Industry)
                .MaximumLength(100).WithMessage("Industry cannot exceed 100 characters.")
                .When(x => !string.IsNullOrEmpty(x.Industry));

            RuleFor(x => x.Position)
                .MaximumLength(100).WithMessage("Position cannot exceed 100 characters.")
                .When(x => !string.IsNullOrEmpty(x.Position));

            RuleFor(x => x.YearsOfExperience)
                .InclusiveBetween(0, 50).WithMessage("Years of experience must be between 0 and 50.")
                .When(x => x.YearsOfExperience.HasValue);

            RuleFor(x => x.LinkedInProfile)
                .MaximumLength(300).WithMessage("LinkedIn profile URL cannot exceed 300 characters.")
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid LinkedIn profile URL.");

            RuleFor(x => x.Website)
                .MaximumLength(300).WithMessage("Website URL cannot exceed 300 characters.")
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid website URL.");
        }
    }
}
