using FluentValidation;
using Server.DTOs.Jobs;

namespace Server.Validators.Jobs
{
    public class JobCreateValidator : AbstractValidator<JobCreateDto>
    {
        public JobCreateValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(400).WithMessage("Title cannot exceed 400 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(4000).WithMessage("Description cannot exceed 4000 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.EmploymentType)
                .MaximumLength(50).WithMessage("EmploymentType cannot exceed 50 characters.")
                .When(x => !string.IsNullOrEmpty(x.EmploymentType));

            RuleFor(x => x.SalaryFrom)
                .GreaterThanOrEqualTo(0).WithMessage("SalaryFrom must be a positive number.")
                .When(x => x.SalaryFrom.HasValue);

            RuleFor(x => x.SalaryTo)
                .GreaterThanOrEqualTo(0).WithMessage("SalaryTo must be a positive number.")
                .When(x => x.SalaryTo.HasValue)
                .GreaterThanOrEqualTo(x => x.SalaryFrom ?? 0).WithMessage("SalaryTo must be greater than or equal to SalaryFrom.")
                .When(x => x.SalaryFrom.HasValue && x.SalaryTo.HasValue);

            RuleFor(x => x.PositionsNeeded)
                .GreaterThan(0).WithMessage("PositionsNeeded must be at least 1.");

            RuleFor(x => x.PositionsFilled)
                .GreaterThanOrEqualTo(0).WithMessage("PositionsFilled must be non-negative.")
                .When(x => x.PositionsFilled.HasValue);

            RuleFor(x => x.DeadlineDate)
                .GreaterThan(DateTime.Now).WithMessage("DeadlineDate must be in the future.")
                .When(x => x.DeadlineDate.HasValue);

            RuleFor(x => x.MinAge)
                .InclusiveBetween(16, 100).WithMessage("MinAge must be between 16 and 100.")
                .When(x => x.MinAge.HasValue);

            RuleFor(x => x.MaxAge)
                .InclusiveBetween(16, 100).WithMessage("MaxAge must be between 16 and 100.")
                .When(x => x.MaxAge.HasValue)
                .GreaterThanOrEqualTo(x => x.MinAge ?? 16).WithMessage("MaxAge must be greater than or equal to MinAge.")
                .When(x => x.MinAge.HasValue && x.MaxAge.HasValue);

            RuleFor(x => x.RequiredExperienceYears)
                .InclusiveBetween(0, 50).WithMessage("RequiredExperienceYears must be between 0 and 50.")
                .When(x => x.RequiredExperienceYears.HasValue);

            RuleFor(x => x.RequiredDegree)
                .MaximumLength(100).WithMessage("RequiredDegree cannot exceed 100 characters.")
                .When(x => !string.IsNullOrEmpty(x.RequiredDegree));

            RuleFor(x => x.GenderPreference)
                .Matches("^(Nam|Nữ|Không yêu cầu)$").WithMessage("GenderPreference must be 'Nam', 'Nữ', or 'Không yêu cầu'.")
                .When(x => !string.IsNullOrEmpty(x.GenderPreference));

            RuleFor(x => x.SkillsRequired)
                .MaximumLength(500).WithMessage("SkillsRequired cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.SkillsRequired));

            RuleFor(x => x.CompanyId)
                .NotNull().WithMessage("CompanyId is required.")
                .When(x => x.CompanyId.HasValue);

            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("CategoryId is required.");

            // Validation for Images (List<JobImageCreateDto>)
            RuleForEach(x => x.Images).ChildRules(image =>
            {
                image.RuleFor(i => i.FilePath)
                    .NotEmpty().WithMessage("Image FilePath is required.")
                    .MaximumLength(500).WithMessage("Image FilePath cannot exceed 500 characters.");

                image.RuleFor(i => i.FileName)
                    .MaximumLength(255).WithMessage("Image FileName cannot exceed 255 characters.")
                    .When(i => !string.IsNullOrEmpty(i.FileName));

                image.RuleFor(i => i.FileType)
                    .MaximumLength(100).WithMessage("Image FileType cannot exceed 100 characters.")
                    .When(i => !string.IsNullOrEmpty(i.FileType));

                image.RuleFor(i => i.FileSize)
                    .GreaterThanOrEqualTo(0).WithMessage("Image FileSize must be a positive number.")
                    .When(i => i.FileSize.HasValue);

                image.RuleFor(i => i.Caption)
                    .MaximumLength(300).WithMessage("Image Caption cannot exceed 300 characters.")
                    .When(i => !string.IsNullOrEmpty(i.Caption));

                image.RuleFor(i => i.SortOrder)
                    .GreaterThanOrEqualTo(0).WithMessage("Image SortOrder must be non-negative.");

                image.RuleFor(i => i.IsActive)
                    .InclusiveBetween(0, 1).WithMessage("Image IsActive must be 0 or 1.");
            }).When(x => x.Images != null && x.Images.Any());
        }
    }
}
