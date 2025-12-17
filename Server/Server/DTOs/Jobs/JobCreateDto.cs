using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Jobs
{
    public class JobCreateDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(400, ErrorMessage = "Title cannot exceed 400 characters.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        [StringLength(50, ErrorMessage = "EmploymentType cannot exceed 50 characters.")]
        public string? EmploymentType { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "SalaryFrom must be a positive number.")]
        public decimal? SalaryFrom { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "SalaryTo must be a positive number.")]
        public decimal? SalaryTo { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "PositionsNeeded must be at least 1.")]
        public int PositionsNeeded { get; set; } = 1;

        [Range(0, int.MaxValue, ErrorMessage = "PositionsFilled must be non-negative.")]
        public int? PositionsFilled { get; set; }

        [DataType(DataType.Date)]
        [FutureDate(ErrorMessage = "DeadlineDate must be in the future.")]
        public DateTime? DeadlineDate { get; set; }

        [Range(16, 100, ErrorMessage = "MinAge must be between 16 and 100.")]
        public int? MinAge { get; set; }

        [Range(16, 100, ErrorMessage = "MaxAge must be between 16 and 100.")]
        public int? MaxAge { get; set; }

        [Range(0, 50, ErrorMessage = "RequiredExperienceYears must be between 0 and 50.")]
        public int? RequiredExperienceYears { get; set; }

        [StringLength(100, ErrorMessage = "RequiredDegree cannot exceed 100 characters.")]
        public string? RequiredDegree { get; set; }

        [RegularExpression("^(Nam|Nữ|Không yêu cầu)$", ErrorMessage = "GenderPreference must be 'Nam', 'Nữ', or 'Không yêu cầu'.")]
        public string? GenderPreference { get; set; }

        [StringLength(500, ErrorMessage = "SkillsRequired cannot exceed 500 characters.")]
        public string? SkillsRequired { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public Guid CategoryId { get; set; }

        // Optional: CompanyId if user has employer profile
        public Guid? CompanyId { get; set; }

        public List<JobImageCreateDto>? Images { get; set; }
    }

    // Custom validation attribute for future date
    public class FutureDateAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is DateTime date)
            {
                if (date <= DateTime.Now)
                {
                    return new ValidationResult(ErrorMessage ?? "Date must be in the future.");
                }
            }
            return ValidationResult.Success;
        }
    }
}
