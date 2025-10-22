using FluentValidation;
using Server.DTOs.Jobs;

namespace Server.Validators.Jobs
{
    public class JobQueryValidator : AbstractValidator<JobQueryDto>
    {
        public JobQueryValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0.");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 50).WithMessage("PageSize must be between 1 and 50.");

            RuleFor(x => x.Search)
                .MaximumLength(100).WithMessage("Search term cannot exceed 100 characters.")
                .When(x => !string.IsNullOrEmpty(x.Search));

            RuleFor(x => x.Category)
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters.")
                .When(x => !string.IsNullOrEmpty(x.Category));
        }
    }
}
