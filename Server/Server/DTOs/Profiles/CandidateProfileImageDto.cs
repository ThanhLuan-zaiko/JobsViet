using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Profiles
{
    public class CandidateProfileImageDto
    {
        public Guid ImageId { get; set; }
        public Guid CandidateId { get; set; }

        [StringLength(50, ErrorMessage = "Image type cannot exceed 50 characters.")]
        public string? ImageType { get; set; } // "profile", "portfolio", etc.

        [StringLength(500, ErrorMessage = "File path cannot exceed 500 characters.")]
        public string? FilePath { get; set; }

        [StringLength(255, ErrorMessage = "File name cannot exceed 255 characters.")]
        public string? FileName { get; set; }

        public long? FileSize { get; set; }

        [StringLength(100, ErrorMessage = "File type cannot exceed 100 characters.")]
        public string? FileType { get; set; }

        [StringLength(300, ErrorMessage = "Caption cannot exceed 300 characters.")]
        public string? Caption { get; set; }

        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
        public bool? IsActive { get; set; }
        public Guid? UploadedByUserId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CandidateProfileImageCreateDto
    {
        [Required(ErrorMessage = "Image type is required.")]
        [StringLength(50, ErrorMessage = "Image type cannot exceed 50 characters.")]
        public string ImageType { get; set; } = string.Empty;

        [Required(ErrorMessage = "File path is required.")]
        [StringLength(500, ErrorMessage = "File path cannot exceed 500 characters.")]
        public string FilePath { get; set; } = string.Empty;

        [Required(ErrorMessage = "File name is required.")]
        [StringLength(255, ErrorMessage = "File name cannot exceed 255 characters.")]
        public string FileName { get; set; } = string.Empty;

        [Required(ErrorMessage = "File size is required.")]
        public long FileSize { get; set; }

        [Required(ErrorMessage = "File type is required.")]
        [StringLength(100, ErrorMessage = "File type cannot exceed 100 characters.")]
        public string FileType { get; set; } = string.Empty;

        [StringLength(300, ErrorMessage = "Caption cannot exceed 300 characters.")]
        public string? Caption { get; set; }

        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
        public bool? IsActive { get; set; }
        public Guid? UploadedByUserId { get; set; }
    }

    public class CandidateProfileImageUpdateDto
    {
        [StringLength(50, ErrorMessage = "Image type cannot exceed 50 characters.")]
        public string? ImageType { get; set; }

        [StringLength(300, ErrorMessage = "Caption cannot exceed 300 characters.")]
        public string? Caption { get; set; }

        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
        public bool? IsActive { get; set; }
    }
}
