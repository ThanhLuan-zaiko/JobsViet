using System;

namespace Server.Models.Profiles
{
    public class EmployerProfile
    {
        public Guid EmployerId { get; set; }
        public Guid UserId { get; set; }
        public string? DisplayName { get; set; }
        public string? ContactPhone { get; set; }
        public string? Bio { get; set; }
        public string? Industry { get; set; }
        public string? Position { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? LinkedInProfile { get; set; }
        public string? Website { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<EmployerCompany> EmployerCompanies { get; set; } = new List<EmployerCompany>();
    }
}
