using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Blogs
{
    public class UpdateBlogDto
    {
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsPublished { get; set; }
    }
}
