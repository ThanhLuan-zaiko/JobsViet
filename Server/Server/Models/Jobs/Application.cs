using System;

namespace Server.Models.Jobs
{
    public class Application
    {
        public Guid ApplicationId { get; set; }
        public Guid JobId { get; set; }
        public Guid CandidateId { get; set; }
        public Guid ResumeId { get; set; }
        public string Status { get; set; } = "APPLIED";
        public DateTime AppliedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsViewedByEmployer { get; set; } = false;
        public DateTime? EmployerViewedAt { get; set; }

        // Navigation properties
        public Job? Job { get; set; }
    }
}

