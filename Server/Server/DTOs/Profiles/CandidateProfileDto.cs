using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Profiles
{
    public class CandidateProfileDto
    {
        public Guid CandidateId { get; set; }
        public Guid UserId { get; set; }

        [StringLength(255, ErrorMessage = "Full name cannot exceed 255 characters.")]
        public string? FullName { get; set; }

        [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string? Phone { get; set; }

        [StringLength(500, ErrorMessage = "Headline cannot exceed 500 characters.")]
        public string? Headline { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        [RegularExpression("^(Nam|Nữ|Khác)$", ErrorMessage = "Gender must be 'Nam', 'Nữ', or 'Khác'.")]
        public string? Gender { get; set; }

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string? Address { get; set; }

        [StringLength(100, ErrorMessage = "Education level cannot exceed 100 characters.")]
        public string? EducationLevel { get; set; }

        [Range(0, 50, ErrorMessage = "Experience years must be between 0 and 50.")]
        public int? ExperienceYears { get; set; }

        [StringLength(1000, ErrorMessage = "Skills cannot exceed 1000 characters.")]
        public string? Skills { get; set; }

        [StringLength(500, ErrorMessage = "LinkedIn profile URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid LinkedIn profile URL.")]
        public string? LinkedInProfile { get; set; }

        [StringLength(500, ErrorMessage = "Portfolio URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid portfolio URL.")]
        public string? PortfolioURL { get; set; }

        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Related images
        public List<CandidateProfileImageDto>? Images { get; set; }
    }

    public class CandidateProfileCreateDto
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(255, ErrorMessage = "Full name cannot exceed 255 characters.")]
        public string FullName { get; set; } = string.Empty;

        [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string? Phone { get; set; }

        [StringLength(500, ErrorMessage = "Headline cannot exceed 500 characters.")]
        public string? Headline { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        [RegularExpression("^(Nam|Nữ|Khác)$", ErrorMessage = "Gender must be 'Nam', 'Nữ', or 'Khác'.")]
        public string? Gender { get; set; }

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string? Address { get; set; }

        [StringLength(100, ErrorMessage = "Education level cannot exceed 100 characters.")]
        public string? EducationLevel { get; set; }

        [Range(0, 50, ErrorMessage = "Experience years must be between 0 and 50.")]
        public int? ExperienceYears { get; set; }

        [StringLength(1000, ErrorMessage = "Skills cannot exceed 1000 characters.")]
        public string? Skills { get; set; }

        [StringLength(500, ErrorMessage = "LinkedIn profile URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid LinkedIn profile URL.")]
        public string? LinkedInProfile { get; set; }

        [StringLength(500, ErrorMessage = "Portfolio URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid portfolio URL.")]
        public string? PortfolioURL { get; set; }

        public string? Bio { get; set; }
    }

    public class CandidateProfileUpdateDto
    {
        [StringLength(255, ErrorMessage = "Full name cannot exceed 255 characters.")]
        public string? FullName { get; set; }

        [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string? Phone { get; set; }

        [StringLength(500, ErrorMessage = "Headline cannot exceed 500 characters.")]
        public string? Headline { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        [RegularExpression("^(Nam|Nữ|Khác)$", ErrorMessage = "Gender must be 'Nam', 'Nữ', or 'Khác'.")]
        public string? Gender { get; set; }

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string? Address { get; set; }

        [StringLength(100, ErrorMessage = "Education level cannot exceed 100 characters.")]
        public string? EducationLevel { get; set; }

        [Range(0, 50, ErrorMessage = "Experience years must be between 0 and 50.")]
        public int? ExperienceYears { get; set; }

        [StringLength(1000, ErrorMessage = "Skills cannot exceed 1000 characters.")]
        public string? Skills { get; set; }

        [StringLength(500, ErrorMessage = "LinkedIn profile URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid LinkedIn profile URL.")]
        public string? LinkedInProfile { get; set; }

        [StringLength(500, ErrorMessage = "Portfolio URL cannot exceed 500 characters.")]
        [Url(ErrorMessage = "Invalid portfolio URL.")]
        public string? PortfolioURL { get; set; }

        public string? Bio { get; set; }
    }
}
