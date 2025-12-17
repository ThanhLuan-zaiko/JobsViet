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

        [Required(ErrorMessage = "Position is required.")]
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

        // Related employer-company relationships
        public List<EmployerCompanyDto>? EmployerCompanies { get; set; }

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

        [Required(ErrorMessage = "Position is required.")]
        [StringLength(255, ErrorMessage = "Position cannot exceed 255 characters.")]
        public string Position { get; set; } = string.Empty;

        [Range(0, 50, ErrorMessage = "Years of experience must be between 0 and 50.")]
        public int? YearsOfExperience { get; set; }

        [StringLength(500, ErrorMessage = "LinkedIn profile URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid LinkedIn profile URL.")]
        public string? LinkedInProfile { get; set; }

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }

        // Companies to create with the profile
        public List<CompanyCreateWithImagesDto>? Companies { get; set; }
    }

    public class CompanyCreateWithImagesDto
    {
        [Required(ErrorMessage = "Company name is required.")]
        [StringLength(255, ErrorMessage = "Company name cannot exceed 255 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Company code cannot exceed 100 characters.")]
        public string? CompanyCode { get; set; }

        [StringLength(500, ErrorMessage = "Website URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }

        public string? Description { get; set; }

        [StringLength(255, ErrorMessage = "Industry cannot exceed 255 characters.")]
        public string? Industry { get; set; }

        [StringLength(50, ErrorMessage = "Company size cannot exceed 50 characters.")]
        public string? CompanySize { get; set; }

        [Range(1800, 2100, ErrorMessage = "Founded year must be between 1800 and 2100.")]
        public int? FoundedYear { get; set; }

        [Required(ErrorMessage = "Logo URL is required.")]
        [StringLength(300, ErrorMessage = "Logo URL cannot exceed 300 characters.")]
        [Url(ErrorMessage = "Invalid logo URL.")]
        public string LogoURL { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string? Address { get; set; }

        [StringLength(255, ErrorMessage = "Contact email cannot exceed 255 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string? ContactEmail { get; set; }

        // Role in the company (e.g., "Owner", "HR", "Manager")
        [Required(ErrorMessage = "Role is required.")]
        [StringLength(255, ErrorMessage = "Role cannot exceed 255 characters.")]
        public string Role { get; set; } = string.Empty;

        // Whether this is the primary company
        public bool? IsPrimary { get; set; }

        // Image files for the company (will be uploaded to image service)
        public List<IFormFile>? Images { get; set; }
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
