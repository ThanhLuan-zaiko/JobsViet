using FluentValidation;
using Server.DTOs.Profiles;

namespace Server.Validators.Profiles
{
    public class CompanyUpdateValidator : AbstractValidator<CompanyUpdateDto>
    {
        public CompanyUpdateValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(300).WithMessage("Company name cannot exceed 300 characters.")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Website)
                .MaximumLength(300).WithMessage("Website URL cannot exceed 300 characters.")
                .Must(uri => uri == null || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid website URL.");

            RuleFor(x => x.Industry)
                .MaximumLength(100).WithMessage("Industry cannot exceed 100 characters.")
                .When(x => !string.IsNullOrEmpty(x.Industry));

            RuleFor(x => x.Size)
                .MaximumLength(50).WithMessage("Company size cannot exceed 50 characters.")
                .When(x => !string.IsNullOrEmpty(x.Size));

            RuleFor(x => x.FoundedYear)
                .InclusiveBetween(1800, DateTime.Now.Year).WithMessage($"Founded year must be between 1800 and {DateTime.Now.Year}.")
                .When(x => x.FoundedYear.HasValue);

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.Address));

            RuleFor(x => x.ContactEmail)
                .MaximumLength(200).WithMessage("Contact email cannot exceed 200 characters.")
                .EmailAddress().WithMessage("Invalid email address.")
                .When(x => !string.IsNullOrEmpty(x.ContactEmail));
        }
    }
}
