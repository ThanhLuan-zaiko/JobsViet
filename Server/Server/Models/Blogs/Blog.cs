using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Models.Auth;

namespace Server.Models.Blogs
{
    public class Blog
    {
        [Key]
        public Guid BlogId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid AuthorUserId { get; set; }

        [ForeignKey("AuthorUserId")]
        public virtual User? Author { get; set; }

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty; // CLOB

        public bool IsPublished { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<BlogImage> Images { get; set; } = new List<BlogImage>();
    }
}
