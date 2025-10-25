using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Models.Auth;
using Server.Models.Jobs;
using Server.Models.Profiles;

namespace Server.Data.Jobs
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobCategory> JobCategories { get; set; }

        // Profile entities
        public DbSet<CandidateProfile> CandidateProfiles { get; set; }
        public DbSet<EmployerProfile> EmployerProfiles { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<EmployerCompany> EmployerCompanies { get; set; }

        // Image entities
        public DbSet<CandidateProfileImage> CandidateProfileImages { get; set; }
        public DbSet<EmployerProfileImage> EmployerProfileImages { get; set; }
        public DbSet<CompanyImage> CompanyImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("USERS");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("USERID");
                entity.Property(e => e.UserId).HasColumnName("USERNAME");
                entity.Property(e => e.Email).HasColumnName("EMAIL").IsRequired().HasMaxLength(200);
                entity.Property(e => e.PasswordHash).HasColumnName("PASSWORDHASH").IsRequired().HasMaxLength(256);
                entity.Property(e => e.Role).HasColumnName("ROLE").IsRequired().HasMaxLength(50);
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
            });

            modelBuilder.Entity<Job>(entity =>
            {
                entity.ToTable("JOBS");
                entity.HasKey(e => e.JobId);
                entity.Property(e => e.JobId).HasColumnName("JOBID");
                entity.Property(e => e.JobGuid).HasColumnName("JOBGUID");
                entity.Property(e => e.PostedByUserId).HasColumnName("POSTEDBYUSERID");
                entity.Property(e => e.EmployerProfileId).HasColumnName("EMPLOYERPROFILEID");
                entity.Property(e => e.CompanyId).HasColumnName("COMPANYID");
                entity.Property(e => e.Title).HasColumnName("TITLE").IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).HasColumnName("DESCRIPTION");
                entity.Property(e => e.EmploymentType).HasColumnName("EMPLOYMENTTYPE");
                entity.Property(e => e.SalaryFrom).HasColumnName("SALARYFROM").HasPrecision(18, 2);
                entity.Property(e => e.SalaryTo).HasColumnName("SALARYTO").HasPrecision(18, 2);
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.HiringStatus).HasColumnName("HIRINGSTATUS");
                entity.Property(e => e.PositionsNeeded).HasColumnName("POSITIONSNEEDED");
                entity.Property(e => e.PositionsFilled).HasColumnName("POSITIONSFILLED");
                entity.Property(e => e.DeadlineDate).HasColumnName("DEADLINEDATE");
                entity.Property(e => e.MinAge).HasColumnName("MINAGE");
                entity.Property(e => e.MaxAge).HasColumnName("MAXAGE");
                entity.Property(e => e.RequiredExperienceYears).HasColumnName("REQUIREDEXPERIENCEYEARS");
                entity.Property(e => e.RequiredDegree).HasColumnName("REQUIREDDEGREE");
                entity.Property(e => e.GenderPreference).HasColumnName("GENDERPREFERENCE");
                entity.Property(e => e.SkillsRequired).HasColumnName("SKILLSREQUIRED");
                entity.Property(e => e.CategoryId).HasColumnName("CATEGORYID");
            });

            modelBuilder.Entity<JobCategory>(entity =>
            {
                entity.ToTable("JOBCATEGORIES");
                entity.HasKey(e => e.CategoryId);
                entity.Property(e => e.CategoryId).HasColumnName("CATEGORYID");
                entity.Property(e => e.Name).HasColumnName("NAME").IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).HasColumnName("DESCRIPTION");
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
            });

            // Profile entities configuration
            modelBuilder.Entity<CandidateProfile>(entity =>
            {
                entity.ToTable("CANDIDATEPROFILES");
                entity.HasKey(e => e.CandidateId);
                entity.Property(e => e.CandidateId).HasColumnName("CANDIDATEID");
                entity.Property(e => e.UserId).HasColumnName("USERID");
                entity.Property(e => e.FullName).HasColumnName("FULLNAME").HasMaxLength(255);
                entity.Property(e => e.Phone).HasColumnName("PHONE").HasMaxLength(20);
                entity.Property(e => e.Headline).HasColumnName("HEADLINE").HasMaxLength(500);
                entity.Property(e => e.DateOfBirth).HasColumnName("DATEOFBIRTH");
                entity.Property(e => e.Gender).HasColumnName("GENDER").HasMaxLength(10);
                entity.Property(e => e.Address).HasColumnName("ADDRESS").HasMaxLength(500);
                entity.Property(e => e.EducationLevel).HasColumnName("EDUCATIONLEVEL").HasMaxLength(100);
                entity.Property(e => e.ExperienceYears).HasColumnName("EXPERIENCEYEARS");
                entity.Property(e => e.Skills).HasColumnName("SKILLS").HasMaxLength(1000);
                entity.Property(e => e.LinkedInProfile).HasColumnName("LINKEDINPROFILE").HasMaxLength(500);
                entity.Property(e => e.PortfolioURL).HasColumnName("PORTFOLIOURL").HasMaxLength(500);
                entity.Property(e => e.Bio).HasColumnName("BIO");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<EmployerProfile>(entity =>
            {
                entity.ToTable("EMPLOYERPROFILES");
                entity.HasKey(e => e.EmployerId);
                entity.Property(e => e.EmployerId).HasColumnName("EMPLOYERID");
                entity.Property(e => e.UserId).HasColumnName("USERID");
                entity.Property(e => e.DisplayName).HasColumnName("DISPLAYNAME").HasMaxLength(255);
                entity.Property(e => e.ContactPhone).HasColumnName("CONTACTPHONE").HasMaxLength(20);
                entity.Property(e => e.Bio).HasColumnName("BIO");
                entity.Property(e => e.Industry).HasColumnName("INDUSTRY").HasMaxLength(255);
                entity.Property(e => e.Position).HasColumnName("POSITION").HasMaxLength(255);
                entity.Property(e => e.YearsOfExperience).HasColumnName("YEARSOFEXPERIENCE");
                entity.Property(e => e.LinkedInProfile).HasColumnName("LINKEDINPROFILE").HasMaxLength(500);
                entity.Property(e => e.Website).HasColumnName("WEBSITE").HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<Company>(entity =>
            {
                entity.ToTable("COMPANIES");
                entity.HasKey(e => e.CompanyId);
                entity.Property(e => e.CompanyId).HasColumnName("COMPANYID");
                entity.Property(e => e.Name).HasColumnName("NAME").IsRequired().HasMaxLength(255);
                entity.Property(e => e.Website).HasColumnName("WEBSITE").HasMaxLength(500);
                entity.Property(e => e.Description).HasColumnName("DESCRIPTION");
                entity.Property(e => e.Industry).HasColumnName("INDUSTRY").HasMaxLength(255);
                entity.Property(e => e.Size).HasColumnName("SIZE").HasMaxLength(50);
                entity.Property(e => e.FoundedYear).HasColumnName("FOUNDEDYEAR");
                entity.Property(e => e.Address).HasColumnName("ADDRESS").HasMaxLength(500);
                entity.Property(e => e.ContactEmail).HasColumnName("CONTACTEMAIL").HasMaxLength(255);
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<EmployerCompany>(entity =>
            {
                entity.ToTable("EMPLOYERCOMPANIES");
                entity.HasKey(e => new { e.EmployerId, e.CompanyId });
                entity.Property(e => e.EmployerId).HasColumnName("EMPLOYERID");
                entity.Property(e => e.CompanyId).HasColumnName("COMPANYID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
            });

            // Image entities configuration
            modelBuilder.Entity<CandidateProfileImage>(entity =>
            {
                entity.ToTable("CANDIDATEPROFILEIMAGES");
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.ImageId).HasColumnName("IMAGEID");
                entity.Property(e => e.CandidateId).HasColumnName("CANDIDATEID");
                entity.Property(e => e.ImageType).HasColumnName("IMAGETYPE").HasMaxLength(50);
                entity.Property(e => e.ImageUrl).HasColumnName("IMAGEURL").HasMaxLength(1000);
                entity.Property(e => e.OriginalFileName).HasColumnName("ORIGINALFILENAME").HasMaxLength(255);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.MimeType).HasColumnName("MIMETYPE").HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<EmployerProfileImage>(entity =>
            {
                entity.ToTable("EMPLOYERPROFILEIMAGES");
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.ImageId).HasColumnName("IMAGEID");
                entity.Property(e => e.EmployerId).HasColumnName("EMPLOYERID");
                entity.Property(e => e.ImageType).HasColumnName("IMAGETYPE").HasMaxLength(50);
                entity.Property(e => e.ImageUrl).HasColumnName("IMAGEURL").HasMaxLength(1000);
                entity.Property(e => e.OriginalFileName).HasColumnName("ORIGINALFILENAME").HasMaxLength(255);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.MimeType).HasColumnName("MIMETYPE").HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<CompanyImage>(entity =>
            {
                entity.ToTable("COMPANYIMAGES");
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.ImageId).HasColumnName("IMAGEID");
                entity.Property(e => e.CompanyId).HasColumnName("COMPANYID");
                entity.Property(e => e.ImageType).HasColumnName("IMAGETYPE").HasMaxLength(50);
                entity.Property(e => e.ImageUrl).HasColumnName("IMAGEURL").HasMaxLength(1000);
                entity.Property(e => e.OriginalFileName).HasColumnName("ORIGINALFILENAME").HasMaxLength(255);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.MimeType).HasColumnName("MIMETYPE").HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });
        }
    }
}
