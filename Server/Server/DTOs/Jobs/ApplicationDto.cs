using System;

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
    }

    public class JobApplicationCountDto
    {
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public int ApplicationCount { get; set; }
    }
}

