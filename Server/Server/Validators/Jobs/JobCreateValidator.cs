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

            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("CategoryId is required.");
        }
    }
}
