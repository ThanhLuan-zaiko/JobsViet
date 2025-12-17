namespace Server.DTOs.Jobs
{
    public class CandidateApplicationDto
    {
        public Guid ApplicationId { get; set; }
        public string Status { get; set; } = "APPLIED";
        public DateTime AppliedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsViewedByEmployer { get; set; }
        public DateTime? EmployerViewedAt { get; set; }
        
        // Job information
        public Guid JobId { get; set; }
        public Guid? JobGuid { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string? JobDescription { get; set; }
        public string? EmploymentType { get; set; }
        public string? Location { get; set; }
        public decimal? SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
        public string? HiringStatus { get; set; }
        public DateTime? DeadlineDate { get; set; }
        
        // Company information
        public Guid? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyLogoUrl { get; set; }
        public string? CompanyAddress { get; set; }
        public string? Industry { get; set; }
        
        // Employer information
        public string? EmployerName { get; set; }
        public string? EmployerAvatarPath { get; set; }
    }

    public class ApplicationStatusUpdateResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? NewStatus { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ApplicationStatusUpdateRequestDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class CandidateStatusNotificationDto
    {
        public Guid ApplicationId { get; set; }
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string OldStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyLogoUrl { get; set; }
    }

    public static class ApplicationStatuses
    {
        public const string APPLIED = "APPLIED";
        public const string REVIEWED = "REVIEWED";
        public const string INTERVIEWING = "INTERVIEWING";
        public const string ACCEPTED = "ACCEPTED";
        public const string REJECTED = "REJECTED";
        
        public static readonly string[] ValidStatuses = 
        {
            APPLIED, REVIEWED, INTERVIEWING, ACCEPTED, REJECTED
        };
        
        public static bool IsValidStatus(string status) =>
            ValidStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}
