using System;

namespace Server.DTOs.Admin
{
    public class AdminJobDto
    {
        public Guid JobId { get; set; }
        public Guid JobGuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? CompanyLogoUrl { get; set; }
        public string? CategoryName { get; set; }
        public string? PostedByEmail { get; set; }
        public int IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? HiringStatus { get; set; }
        public decimal? SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
        public DateTime? DeadlineDate { get; set; }
    }
}
