using System;

namespace Server.Models.Profiles
{
    public class EmployerCompany
    {
        public Guid Id { get; set; }
        public Guid EmployerProfileId { get; set; }
        public Guid CompanyId { get; set; }
        public string? Role { get; set; } // e.g., "Owner", "HR", "Manager"
        public bool? IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
