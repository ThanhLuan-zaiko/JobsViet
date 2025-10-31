using System;

namespace Server.Models.Profiles
{
    public class EmployerProfileImage
    {
        public Guid ImageId { get; set; }
        public Guid EmployerId { get; set; }
        public string? ImageType { get; set; } // "profile", "company_logo", etc.
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
        public long? FileSize { get; set; }
        public string? FileType { get; set; }
        public string? Caption { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
        public bool? IsActive { get; set; }
        public Guid? UploadedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
