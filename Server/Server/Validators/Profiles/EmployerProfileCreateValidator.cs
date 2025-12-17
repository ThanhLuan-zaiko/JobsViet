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
                .Matches("^\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$").WithMessage("Invalid phone number format.")
                .When(x => !string.IsNullOrEmpty(x.ContactPhone));

            RuleFor(x => x.Industry)
                .MaximumLength(255).WithMessage("Industry cannot exceed 255 characters.");

            RuleFor(x => x.Position)
                .NotEmpty().WithMessage("Position is required.")
                .MaximumLength(255).WithMessage("Position cannot exceed 255 characters.");

            RuleFor(x => x.YearsOfExperience)
                .InclusiveBetween(0, 50).WithMessage("Years of experience must be between 0 and 50.")
                .When(x => x.YearsOfExperience.HasValue);

            RuleFor(x => x.LinkedInProfile)
                .MaximumLength(500).WithMessage("LinkedIn profile URL cannot exceed 500 characters.")
                .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid LinkedIn profile URL.");

            RuleFor(x => x.Website)
                .MaximumLength(500).WithMessage("Website URL cannot exceed 500 characters.")
                .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Invalid website URL.");

            // Companies validation
            RuleForEach(x => x.Companies).ChildRules(company =>
            {
                company.RuleFor(c => c.Name)
                    .NotEmpty().WithMessage("Company name is required.")
                    .MaximumLength(255).WithMessage("Company name cannot exceed 255 characters.");

                company.RuleFor(c => c.Website)
                    .MaximumLength(500).WithMessage("Website URL cannot exceed 500 characters.")
                    .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
                    .WithMessage("Invalid website URL.")
                    .When(c => !string.IsNullOrEmpty(c.Website));

                company.RuleFor(c => c.Industry)
                    .MaximumLength(255).WithMessage("Industry cannot exceed 255 characters.");

                company.RuleFor(c => c.CompanySize)
                    .MaximumLength(50).WithMessage("Company size cannot exceed 50 characters.");

                company.RuleFor(c => c.FoundedYear)
                    .InclusiveBetween(1800, DateTime.Now.Year).WithMessage($"Founded year must be between 1800 and {DateTime.Now.Year}.")
                    .When(c => c.FoundedYear.HasValue);

                company.RuleFor(c => c.LogoURL)
                    .NotEmpty().WithMessage("Logo URL is required.")
                    .MaximumLength(300).WithMessage("Logo URL cannot exceed 300 characters.")
                    .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
                    .WithMessage("Invalid logo URL.");

                company.RuleFor(c => c.Address)
                    .MaximumLength(500).WithMessage("Address cannot exceed 500 characters.");

                company.RuleFor(c => c.ContactEmail)
                    .MaximumLength(255).WithMessage("Contact email cannot exceed 255 characters.")
                    .EmailAddress().WithMessage("Invalid email address.")
                    .When(c => !string.IsNullOrEmpty(c.ContactEmail));

                company.RuleFor(c => c.Role)
                    .NotEmpty().WithMessage("Role is required.")
                    .MaximumLength(255).WithMessage("Role cannot exceed 255 characters.");

                // Image files validation - only when images are provided
                company.When(c => c.Images != null && c.Images.Any(), () =>
                {
                    company.RuleForEach(c => c.Images).ChildRules(image =>
                    {
                        image.RuleFor(i => i.Length)
                            .LessThanOrEqualTo(5 * 1024 * 1024).WithMessage("Image file size cannot exceed 5MB.");

                        image.RuleFor(i => i.ContentType)
                            .Must(contentType => contentType.StartsWith("image/")).WithMessage("Only image files are allowed.");
                    });
                });
            });
        }
    }
}
