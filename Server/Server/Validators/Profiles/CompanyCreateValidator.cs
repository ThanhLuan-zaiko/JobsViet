using FluentValidation;
using Server.DTOs.Profiles;

namespace Server.Validators.Profiles
{
    public class CompanyCreateValidator : AbstractValidator<CompanyCreateDto>
    {
        public CompanyCreateValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Company name is required.")
                .MaximumLength(255).WithMessage("Company name cannot exceed 255 characters.");

            RuleFor(x => x.Website)
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid website URL.");

            RuleFor(x => x.Industry)
                .MaximumLength(255).WithMessage("Industry cannot exceed 255 characters.");

            RuleFor(x => x.Size)
                .MaximumLength(50).WithMessage("Company size cannot exceed 50 characters.");

            RuleFor(x => x.FoundedYear)
                .InclusiveBetween(1800, DateTime.Now.Year).WithMessage($"Founded year must be between 1800 and {DateTime.Now.Year}.")
                .When(x => x.FoundedYear.HasValue);

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters.");

            RuleFor(x => x.ContactEmail)
                .EmailAddress().WithMessage("Invalid email address.")
                .When(x => !string.IsNullOrEmpty(x.ContactEmail));
        }
    }
}
