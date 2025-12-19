using Server.DTOs.Auth;

namespace Server.DTOs.Blogs
{
    public class BlogDto
    {
        public Guid BlogId { get; set; }
        public Guid AuthorUserId { get; set; }
        public string AuthorName { get; set; } = string.Empty; 
        public string AuthorAvatar { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<BlogImageDto> Images { get; set; } = new List<BlogImageDto>();
    }
}
