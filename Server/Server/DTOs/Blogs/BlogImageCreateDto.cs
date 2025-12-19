using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Blogs
{
    public class BlogImageCreateDto
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

        public bool IsPrimary { get; set; } = false;

        [Required(ErrorMessage = "UploadedByUserId is required.")]
        public Guid UploadedByUserId { get; set; }
    }
}
