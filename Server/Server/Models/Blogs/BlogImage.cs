using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Models.Auth;

namespace Server.Models.Blogs
{
    public class BlogImage
    {
        [Key]
        public Guid BlogImageId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BlogId { get; set; }

        [ForeignKey("BlogId")]
        public virtual Blog? Blog { get; set; }

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? FileName { get; set; }

        [MaxLength(100)]
        public string? FileType { get; set; }

        public long? FileSize { get; set; }

        [MaxLength(300)]
        public string? Caption { get; set; }

        public int SortOrder { get; set; } = 0;

        public bool IsPrimary { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public Guid? UploadedByUserId { get; set; }

        [ForeignKey("UploadedByUserId")]
        public virtual User? Uploader { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }
    }
}
