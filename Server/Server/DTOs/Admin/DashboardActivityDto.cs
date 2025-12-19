using System;

namespace Server.DTOs.Admin
{
    public class DashboardActivityDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "User", "Job", "Application"
        public DateTime CreatedAt { get; set; }
    }
}
