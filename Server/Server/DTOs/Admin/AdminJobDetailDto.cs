using System;
using System.Collections.Generic;

namespace Server.DTOs.Admin
{
    public class AdminJobDetailDto
    {
        public Guid JobId { get; set; }
        public Guid JobGuid { get; set; }
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
        public string? CategoryName { get; set; }
        public string? PostedByEmail { get; set; }
        
        public AdminJobCompanyDto? Company { get; set; }
        public List<AdminJobApplicationDto> Applications { get; set; } = new();
    }

    public class AdminJobCompanyDto
    {
        public Guid CompanyId { get; set; }
        public string? Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? Website { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
    }

    public class AdminJobApplicationDto
    {
        public Guid ApplicationId { get; set; }
        public Guid CandidateId { get; set; }
        public string? CandidateName { get; set; }
        public string? CandidateEmail { get; set; }
        public string? Status { get; set; }
        public DateTime AppliedAt { get; set; }
        public bool IsViewedByEmployer { get; set; }
    }
}
