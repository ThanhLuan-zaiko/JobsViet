using System;

namespace Server.Models.Jobs
{
    public class JobCategory
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
