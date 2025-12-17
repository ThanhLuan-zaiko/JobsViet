using System;

namespace Server.Models.Jobs
{
    public class JobImage
    {
        public Guid JobImageId { get; set; }
        public Guid JobId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string? FileName { get; set; }
        public string? FileType { get; set; }
        public long? FileSize { get; set; }
        public string? Caption { get; set; }
        public int SortOrder { get; set; } = 0;
        public int IsPrimary { get; set; } = 0;
        public int IsActive { get; set; } = 1;
        public Guid? UploadedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Job? Job { get; set; }
    }
}
