using System;
using System.Collections.Generic;

namespace Server.DTOs.Jobs
{
    public class ApplicationDto
    {
        public Guid ApplicationId { get; set; }
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public Guid CandidateId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string? CandidateEmail { get; set; }
        public string? CandidatePhone { get; set; }
        public string Status { get; set; } = "APPLIED";
        public DateTime AppliedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsViewed { get; set; }
        public CandidateProfileSummaryDto? CandidateProfile { get; set; }
    }

    public class JobApplicationCountDto
    {
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public int ApplicationCount { get; set; }
        public int UnreadCount { get; set; }
    }

    public class CandidateProfileSummaryDto
    {
        public string? Headline { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? ExperienceYears { get; set; }
        public string? EducationLevel { get; set; }
        public string? Skills { get; set; }
        public string? Bio { get; set; }
        public string? LinkedInProfile { get; set; }
        public string? PortfolioUrl { get; set; }
        public string? AvatarPath { get; set; }
        public List<string>? PortfolioImagePaths { get; set; }
    }

    public class ApplicationNotificationDto
    {
        public Guid ApplicationId { get; set; }
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public Guid CandidateId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string? CandidateEmail { get; set; }
        public string? CandidateHeadline { get; set; }
        public string? AvatarPath { get; set; }
        public DateTime AppliedAt { get; set; }
        public bool IsViewed { get; set; }
    }

    public class EmployerApplicationsSummaryDto
    {
        public int TotalUnread { get; set; }
        public List<JobApplicationCountDto> JobCounts { get; set; } = new();
        public List<ApplicationNotificationDto> RecentNotifications { get; set; } = new();
    }
}

