using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Profiles
{
    public class EmployerProfileImageDto
    {
        public Guid ImageId { get; set; }
        public Guid EmployerId { get; set; }

        [StringLength(50, ErrorMessage = "Image type cannot exceed 50 characters.")]
        public string? ImageType { get; set; } // "profile", "company_logo", etc.

        [StringLength(1000, ErrorMessage = "Image URL cannot exceed 1000 characters.")]
        [Url(ErrorMessage = "Invalid image URL.")]
        public string? ImageUrl { get; set; }

        [StringLength(255, ErrorMessage = "Original file name cannot exceed 255 characters.")]
        public string? OriginalFileName { get; set; }

        public long? FileSize { get; set; }

        [StringLength(100, ErrorMessage = "MIME type cannot exceed 100 characters.")]
        public string? MimeType { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class EmployerProfileImageCreateDto
    {
        [Required(ErrorMessage = "Image type is required.")]
        [StringLength(50, ErrorMessage = "Image type cannot exceed 50 characters.")]
        public string ImageType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Image URL is required.")]
        [StringLength(1000, ErrorMessage = "Image URL cannot exceed 1000 characters.")]
        [Url(ErrorMessage = "Invalid image URL.")]
        public string ImageUrl { get; set; } = string.Empty;

        [Required(ErrorMessage = "Original file name is required.")]
        [StringLength(255, ErrorMessage = "Original file name cannot exceed 255 characters.")]
        public string OriginalFileName { get; set; } = string.Empty;

        [Required(ErrorMessage = "File size is required.")]
        public long FileSize { get; set; }

        [Required(ErrorMessage = "MIME type is required.")]
        [StringLength(100, ErrorMessage = "MIME type cannot exceed 100 characters.")]
        public string MimeType { get; set; } = string.Empty;
    }

    public class EmployerProfileImageUpdateDto
    {
        [StringLength(50, ErrorMessage = "Image type cannot exceed 50 characters.")]
        public string? ImageType { get; set; }
    }
}
