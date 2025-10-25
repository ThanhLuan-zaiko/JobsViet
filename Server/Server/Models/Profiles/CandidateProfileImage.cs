using System;

namespace Server.Models.Profiles
{
    public class CandidateProfileImage
    {
        public Guid ImageId { get; set; }
        public Guid CandidateId { get; set; }
        public string? ImageType { get; set; } // "profile", "portfolio", etc.
        public string? ImageUrl { get; set; }
        public string? OriginalFileName { get; set; }
        public long? FileSize { get; set; }
        public string? MimeType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
