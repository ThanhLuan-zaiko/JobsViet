using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Models.Profiles
{
    public class Company
    {
        public Guid CompanyId { get; set; }
        public string? Name { get; set; }
        public string? CompanyCode { get; set; }
        public string? Website { get; set; }
        public string? Description { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public int? FoundedYear { get; set; }
        [Required(ErrorMessage = "LogoURL is required.")]
        [StringLength(300, ErrorMessage = "Logo URL cannot exceed 300 characters.")]
        [Url(ErrorMessage = "Invalid logo URL.")]
        public string LogoURL { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? ContactEmail { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
