using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Profiles
{
    public class CompanyDto
    {
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "Company name is required.")]
        [StringLength(255, ErrorMessage = "Company name cannot exceed 255 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }

        public string? Description { get; set; }

        [StringLength(255, ErrorMessage = "Industry cannot exceed 255 characters.")]
        public string? Industry { get; set; }

        [StringLength(50, ErrorMessage = "Company size cannot exceed 50 characters.")]
        public string? Size { get; set; }

        [Range(1800, 2100, ErrorMessage = "Founded year must be between 1800 and 2100.")]
        public int? FoundedYear { get; set; }

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string? Address { get; set; }

        [StringLength(255, ErrorMessage = "Contact email cannot exceed 255 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string? ContactEmail { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Related images
        public List<CompanyImageDto>? Images { get; set; }
    }

    public class CompanyCreateDto
    {
        [Required(ErrorMessage = "Company name is required.")]
        [StringLength(255, ErrorMessage = "Company name cannot exceed 255 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }

        public string? Description { get; set; }

        [StringLength(255, ErrorMessage = "Industry cannot exceed 255 characters.")]
        public string? Industry { get; set; }

        [StringLength(50, ErrorMessage = "Company size cannot exceed 50 characters.")]
        public string? Size { get; set; }

        [Range(1800, 2100, ErrorMessage = "Founded year must be between 1800 and 2100.")]
        public int? FoundedYear { get; set; }

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string? Address { get; set; }

        [StringLength(255, ErrorMessage = "Contact email cannot exceed 255 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string? ContactEmail { get; set; }
    }

    public class CompanyUpdateDto
    {
        [StringLength(255, ErrorMessage = "Company name cannot exceed 255 characters.")]
        public string? Name { get; set; }

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }

        public string? Description { get; set; }

        [StringLength(255, ErrorMessage = "Industry cannot exceed 255 characters.")]
        public string? Industry { get; set; }

        [StringLength(50, ErrorMessage = "Company size cannot exceed 50 characters.")]
        public string? Size { get; set; }

        [Range(1800, 2100, ErrorMessage = "Founded year must be between 1800 and 2100.")]
        public int? FoundedYear { get; set; }

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string? Address { get; set; }

        [StringLength(255, ErrorMessage = "Contact email cannot exceed 255 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string? ContactEmail { get; set; }
    }
}
