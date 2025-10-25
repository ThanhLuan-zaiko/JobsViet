using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Profiles
{
    public class EmployerProfileDto
    {
        public Guid EmployerId { get; set; }
        public Guid UserId { get; set; }

        [StringLength(255, ErrorMessage = "Display name cannot exceed 255 characters.")]
        public string? DisplayName { get; set; }

        [StringLength(20, ErrorMessage = "Contact phone cannot exceed 20 characters.")]
        [Phone(ErrorMessage = "Invalid contact phone format.")]
        public string? ContactPhone { get; set; }

        public string? Bio { get; set; }

        [StringLength(255, ErrorMessage = "Industry cannot exceed 255 characters.")]
        public string? Industry { get; set; }

        [StringLength(255, ErrorMessage = "Position cannot exceed 255 characters.")]
        public string? Position { get; set; }

        [Range(0, 50, ErrorMessage = "Years of experience must be between 0 and 50.")]
        public int? YearsOfExperience { get; set; }

        [StringLength(500, ErrorMessage = "LinkedIn profile URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid LinkedIn profile URL.")]
        public string? LinkedInProfile { get; set; }

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Related images
        public List<EmployerProfileImageDto>? Images { get; set; }

        // Related companies
        public List<CompanyDto>? Companies { get; set; }
    }

    public class EmployerProfileCreateDto
    {
        [Required(ErrorMessage = "Display name is required.")]
        [StringLength(255, ErrorMessage = "Display name cannot exceed 255 characters.")]
        public string DisplayName { get; set; } = string.Empty;

        [StringLength(20, ErrorMessage = "Contact phone cannot exceed 20 characters.")]
        [Phone(ErrorMessage = "Invalid contact phone format.")]
        public string? ContactPhone { get; set; }

        public string? Bio { get; set; }

        [StringLength(255, ErrorMessage = "Industry cannot exceed 255 characters.")]
        public string? Industry { get; set; }

        [StringLength(255, ErrorMessage = "Position cannot exceed 255 characters.")]
        public string? Position { get; set; }

        [Range(0, 50, ErrorMessage = "Years of experience must be between 0 and 50.")]
        public int? YearsOfExperience { get; set; }

        [StringLength(500, ErrorMessage = "LinkedIn profile URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid LinkedIn profile URL.")]
        public string? LinkedInProfile { get; set; }

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }
    }

    public class EmployerProfileUpdateDto
    {
        [StringLength(255, ErrorMessage = "Display name cannot exceed 255 characters.")]
        public string? DisplayName { get; set; }

        [StringLength(20, ErrorMessage = "Contact phone cannot exceed 20 characters.")]
        [Phone(ErrorMessage = "Invalid contact phone format.")]
        public string? ContactPhone { get; set; }

        public string? Bio { get; set; }

        [StringLength(255, ErrorMessage = "Industry cannot exceed 255 characters.")]
        public string? Industry { get; set; }

        [StringLength(255, ErrorMessage = "Position cannot exceed 255 characters.")]
        public string? Position { get; set; }

        [Range(0, 50, ErrorMessage = "Years of experience must be between 0 and 50.")]
        public int? YearsOfExperience { get; set; }

        [StringLength(500, ErrorMessage = "LinkedIn profile URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid LinkedIn profile URL.")]
        public string? LinkedInProfile { get; set; }

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }
    }
}
