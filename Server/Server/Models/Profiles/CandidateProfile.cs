using System;

namespace Server.Models.Profiles
{
    public class CandidateProfile
    {
        public Guid CandidateId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Headline { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? EducationLevel { get; set; }
        public int? ExperienceYears { get; set; }
        public string? Skills { get; set; }
        public string? LinkedInProfile { get; set; }
        public string? PortfolioURL { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
