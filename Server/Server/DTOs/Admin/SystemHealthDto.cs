namespace Server.DTOs.Admin
{
    public class SystemHealthDto
    {
        public string Status { get; set; } = "Stable";
        public List<ServiceStatusDto> Services { get; set; } = new();
        public ResourceUsageDto Resources { get; set; } = new();
    }

    public class ServiceStatusDto
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = "Offline";
        public string Performance { get; set; } = "N/A";
    }

    public class ResourceUsageDto
    {
        public double MemoryPercentage { get; set; }
        public string PeakLoad { get; set; } = "0 rps";
    }
}
