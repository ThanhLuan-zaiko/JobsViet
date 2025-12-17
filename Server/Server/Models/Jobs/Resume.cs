using System;

namespace Server.Models.Jobs
{
    public class Resume
    {
        public Guid ResumeId { get; set; }
        public Guid CandidateId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

