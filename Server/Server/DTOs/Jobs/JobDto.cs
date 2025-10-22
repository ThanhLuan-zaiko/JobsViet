using System;

namespace Server.DTOs.Jobs
{
    public class JobDto
    {
        public Guid JobId { get; set; }
        public Guid JobGuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? EmploymentType { get; set; }
        public decimal? SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
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
    }
}
