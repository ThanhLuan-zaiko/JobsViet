using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Jobs
{
    public class JobImageDto
    {
        public Guid JobImageId { get; set; }
        public Guid JobId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string? FileName { get; set; }
        public long? FileSize { get; set; }
        public string? FileType { get; set; }
        public string? Caption { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsActive { get; set; }
        public Guid? UploadedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
