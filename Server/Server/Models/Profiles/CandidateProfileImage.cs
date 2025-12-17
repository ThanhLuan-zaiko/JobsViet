using System;

namespace Server.Models.Profiles
{
    public class CandidateProfileImage
    {
        public Guid ImageId { get; set; }
        public Guid CandidateId { get; set; }
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
