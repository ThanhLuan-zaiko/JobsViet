using System;
using System.Collections.Generic;

namespace Server.DTOs.Admin
{
    public class AdminUserDetailDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public AdminUserProfileInfoDto? Profile { get; set; }
        public List<AdminUserBlogDto> Blogs { get; set; } = new();
        public List<AdminUserJobDto> Jobs { get; set; } = new();
    }

    public class AdminUserProfileInfoDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
        // For Candidate
        public string? Headline { get; set; }
        public string? Skills { get; set; }
        // For Employer
        public string? Industry { get; set; }
        public string? CompanyName { get; set; }
    }

    public class AdminUserBlogDto
    {
        public Guid BlogId { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminUserJobDto
    {
        public Guid JobId { get; set; }
        public Guid JobGuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public int IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
