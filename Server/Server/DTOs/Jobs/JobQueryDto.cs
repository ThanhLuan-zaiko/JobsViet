using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Jobs
{
    public class JobQueryDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 50, ErrorMessage = "PageSize must be between 1 and 50.")]
        public int PageSize { get; set; } = 10;

        [StringLength(100, ErrorMessage = "Search term cannot exceed 100 characters.")]
        public string? Search { get; set; }

        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters.")]
        public string? Category { get; set; }
    }
}
