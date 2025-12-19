namespace Server.DTOs.Admin
{
    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalJobs { get; set; }
        public int ActiveJobs { get; set; }
        public int TotalApplications { get; set; }
        public List<DashboardActivityDto> RecentActivities { get; set; } = new();
        public List<DashboardChartItemDto> ApplicationsByStatus { get; set; } = new();
        public List<DashboardChartItemDto> MonthlyRegistrations { get; set; } = new();
        public List<DashboardChartItemDto> ApplicationTrends { get; set; } = new();
        public List<DashboardChartItemDto> UserRolesDistribution { get; set; } = new();
        public List<DashboardChartItemDto> TopJobCategories { get; set; } = new();
    }
}
