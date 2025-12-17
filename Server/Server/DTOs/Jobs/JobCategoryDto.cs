using System;

namespace Server.DTOs.Jobs
{
    public class JobCategoryDto
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
