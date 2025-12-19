using System;
using System.Collections.Generic;

namespace Server.DTOs.Admin
{
    public class AdminUserDetailDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? Role { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        public AdminUserProfileInfoDto? Profile { get; set; }
        public List<AdminUserBlogDto> Blogs { get; set; } = new();
        public List<AdminUserJobDto> Jobs { get; set; } = new();
        public List<AdminUserApplicationDto> Applications { get; set; } = new();
    }

    public class AdminUserProfileInfoDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        // For Candidate
        public string? Headline { get; set; }
        public string? Skills { get; set; }
        public string? EducationLevel { get; set; }
        public int? ExperienceYears { get; set; }
        public string? LinkedInProfile { get; set; }
        public string? PortfolioURL { get; set; }
        public List<string> PortfolioImages { get; set; } = new();
        // For Employer
        public string? Industry { get; set; }
        public string? Website { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? Position { get; set; }
        public List<AdminUserCompanyDto> Companies { get; set; } = new();
    }

    public class AdminUserCompanyDto
    {
        public Guid CompanyId { get; set; }
        public string? Name { get; set; }
        public string? Website { get; set; }
        public string? LogoUrl { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class AdminUserBlogDto
    {
        public Guid BlogId { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminUserJobDto
    {
        public Guid JobId { get; set; }
        public Guid JobGuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public int IsActive { get; set; }
        public string? CompanyLogoUrl { get; set; }
        public string? HiringStatus { get; set; }
        public decimal? SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
        public DateTime? DeadlineDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminUserApplicationDto
    {
        public Guid ApplicationId { get; set; }
        public Guid JobGuid { get; set; }
        public string? JobTitle { get; set; }
        public string? CompanyName { get; set; }
        public string? Status { get; set; }
        public bool IsViewedByEmployer { get; set; }
        public DateTime AppliedAt { get; set; }
    }
}
