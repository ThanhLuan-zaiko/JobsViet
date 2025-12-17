using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Jobs
{
    public class JobImageCreateDto
    {
        [Required(ErrorMessage = "FilePath is required.")]
        [StringLength(500, ErrorMessage = "FilePath cannot exceed 500 characters.")]
        public string FilePath { get; set; } = string.Empty;

        [StringLength(255, ErrorMessage = "FileName cannot exceed 255 characters.")]
        public string? FileName { get; set; }

        [StringLength(100, ErrorMessage = "FileType cannot exceed 100 characters.")]
        public string? FileType { get; set; }

        [Range(0, long.MaxValue, ErrorMessage = "FileSize must be a positive number.")]
        public long? FileSize { get; set; }

        [StringLength(300, ErrorMessage = "Caption cannot exceed 300 characters.")]
        public string? Caption { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "SortOrder must be non-negative.")]
        public int SortOrder { get; set; } = 0;

        public bool IsPrimary { get; set; } = true;

        [Range(0, int.MaxValue, ErrorMessage = "IsActive must be 0 or 1.")]
        public int IsActive { get; set; } = 1;

        [Required(ErrorMessage = "UploadedByUserId is required.")]
        public Guid UploadedByUserId { get; set; }
    }
}
