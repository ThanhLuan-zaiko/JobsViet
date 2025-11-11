using System;
using Server.Models.Profiles;

namespace Server.Models.Jobs
{
    public class Job
    {
        public Guid JobId { get; set; }
        public Guid JobGuid { get; set; }
        public Guid PostedByUserId { get; set; }
        public Guid? EmployerProfileId { get; set; }
        public Guid? CompanyId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? EmploymentType { get; set; }
        public decimal? SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
        public int IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? HiringStatus { get; set; }
        public int? PositionsNeeded { get; set; }
        public int? PositionsFilled { get; set; }
        public DateTime? DeadlineDate { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public int? RequiredExperienceYears { get; set; }
        public string? RequiredDegree { get; set; }
        public string? GenderPreference { get; set; }
        public string? SkillsRequired { get; set; }
        public Guid? CategoryId { get; set; }

        // Navigation property
        public Company? Company { get; set; }
    }
}
