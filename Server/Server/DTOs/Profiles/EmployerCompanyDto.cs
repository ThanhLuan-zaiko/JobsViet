using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Profiles
{
    public class EmployerCompanyDto
    {
        public Guid Id { get; set; }
        public Guid EmployerProfileId { get; set; }
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        [StringLength(100, ErrorMessage = "Role cannot exceed 100 characters.")]
        public string Role { get; set; } = string.Empty;

        public bool? IsPrimary { get; set; }
    }

    public class EmployerCompanyCreateDto
    {
        [Required(ErrorMessage = "Employer Profile Id is required.")]
        public Guid EmployerProfileId { get; set; }

        [Required(ErrorMessage = "Company Id is required.")]
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        [StringLength(100, ErrorMessage = "Role cannot exceed 100 characters.")]
        public string Role { get; set; } = string.Empty;

        public bool? IsPrimary { get; set; }
    }

    public class EmployerCompanyUpdateDto
    {
        [Required(ErrorMessage = "Role is required.")]
        [StringLength(100, ErrorMessage = "Role cannot exceed 100 characters.")]
        public string Role { get; set; } = string.Empty;

        public bool? IsPrimary { get; set; }
    }
}
