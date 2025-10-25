using System;

namespace Server.Models.Profiles
{
    public class EmployerCompany
    {
        public Guid EmployerCompanyId { get; set; }
        public Guid EmployerId { get; set; }
        public Guid CompanyId { get; set; }
        public string? Role { get; set; } // e.g., "Owner", "HR", "Manager"
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
