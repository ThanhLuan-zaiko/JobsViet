using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Models.Auth;
using Server.Models.Jobs;
using Server.Models.Profiles;
using Server.Models.Blogs;

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
        public DbSet<JobImage> JobImages { get; set; }

        // Application entities
        public DbSet<Resume> Resumes { get; set; }
        public DbSet<Application> Applications { get; set; }

        // Notification and Message entities
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Message> Messages { get; set; }

        // Blog entities
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<BlogImage> BlogImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("USERS");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("USERID");
                entity.Property(e => e.UserName).HasColumnName("USERNAME");
                entity.Property(e => e.Email).HasColumnName("EMAIL").IsRequired().HasMaxLength(200);
                entity.Property(e => e.PasswordHash).HasColumnName("PASSWORDHASH").IsRequired().HasMaxLength(4000);
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

                // Define relationship with Company
                entity.HasOne(j => j.Company)
                    .WithMany()
                    .HasForeignKey(j => j.CompanyId)
                    .OnDelete(DeleteBehavior.SetNull);
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
                entity.HasIndex(e => e.UserId).IsUnique(); // Add unique constraint on UserId
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
                entity.Property(e => e.EmployerId).HasColumnName("EMPLOYERPROFILEID");
                entity.Property(e => e.UserId).HasColumnName("USERID");
                entity.Property(e => e.DisplayName).HasColumnName("DISPLAYNAME").IsRequired().HasMaxLength(255);
                entity.Property(e => e.ContactPhone).HasColumnName("CONTACTPHONE").IsRequired().HasMaxLength(20);
                entity.Property(e => e.Bio).HasColumnName("BIO").IsRequired();
                entity.Property(e => e.Industry).HasColumnName("INDUSTRY").IsRequired().HasMaxLength(255);
                entity.Property(e => e.Position).HasColumnName("POSITION").IsRequired().HasMaxLength(255);
                entity.Property(e => e.YearsOfExperience).HasColumnName("YEARSOFEXPERIENCE").IsRequired();
                entity.Property(e => e.LinkedInProfile).HasColumnName("LINKEDINPROFILE").IsRequired().HasMaxLength(500);
                entity.Property(e => e.Website).HasColumnName("WEBSITE").IsRequired().HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<Company>(entity =>
            {
                entity.ToTable("COMPANIES");
                entity.HasKey(e => e.CompanyId);
                entity.Property(e => e.CompanyId).HasColumnName("COMPANYID");
                entity.Property(e => e.Name).HasColumnName("NAME").IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyCode).HasColumnName("COMPANYCODE").HasMaxLength(100);
                entity.Property(e => e.Website).HasColumnName("WEBSITE").HasMaxLength(500);
                entity.Property(e => e.Description).HasColumnName("DESCRIPTION");
                entity.Property(e => e.Industry).HasColumnName("INDUSTRY").HasMaxLength(255);
                entity.Property(e => e.CompanySize).HasColumnName("COMPANYSIZE").HasMaxLength(50);
                entity.Property(e => e.FoundedYear).HasColumnName("FOUNDEDYEAR");
                entity.Property(e => e.LogoURL).HasColumnName("LOGOURL").IsRequired().HasMaxLength(300);
                entity.Property(e => e.Address).HasColumnName("ADDRESS").HasMaxLength(500);
                entity.Property(e => e.ContactEmail).HasColumnName("CONTACTEMAIL").HasMaxLength(255);
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<EmployerCompany>(entity =>
            {
                entity.ToTable("EMPLOYERCOMPANIES");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.EmployerProfileId).HasColumnName("EMPLOYERPROFILEID");
                entity.Property(e => e.CompanyId).HasColumnName("COMPANYID");
                entity.Property(e => e.Role).HasColumnName("ROLE");
                entity.Property(e => e.IsPrimary).HasColumnName("ISPRIMARY");

                // Define relationships
                entity.HasOne(ec => ec.EmployerProfile)
                    .WithMany(ep => ep.EmployerCompanies)
                    .HasForeignKey(ec => ec.EmployerProfileId);

                entity.HasOne(ec => ec.Company)
                    .WithMany(c => c.EmployerCompanies)
                    .HasForeignKey(ec => ec.CompanyId);
            });

            // Image entities configuration
            modelBuilder.Entity<CandidateProfileImage>(entity =>
            {
                entity.ToTable("CANDIDATEIMAGES");
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.ImageId).HasColumnName("CANDIDATEIMAGEID");
                entity.Property(e => e.CandidateId).HasColumnName("CANDIDATEID");
                entity.Property(e => e.FilePath).HasColumnName("FILEPATH").HasMaxLength(500);
                entity.Property(e => e.FileName).HasColumnName("FILENAME").HasMaxLength(255);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.FileType).HasColumnName("FILETYPE").HasMaxLength(100);
                entity.Property(e => e.Caption).HasColumnName("CAPTION").HasMaxLength(300);
                entity.Property(e => e.SortOrder).HasColumnName("SORTORDER");
                entity.Property(e => e.IsPrimary).HasColumnName("ISPRIMARY");
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.UploadedByUserId).HasColumnName("UPLOADEDBYUSERID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<EmployerProfileImage>(entity =>
            {
                entity.ToTable("EMPLOYERIMAGES");
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.ImageId).HasColumnName("EMPLOYERIMAGEID");
                entity.Property(e => e.EmployerId).HasColumnName("EMPLOYERPROFILEID");
                entity.Property(e => e.FilePath).HasColumnName("FILEPATH").HasMaxLength(500);
                entity.Property(e => e.FileName).HasColumnName("FILENAME").HasMaxLength(255);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.FileType).HasColumnName("FILETYPE").HasMaxLength(100);
                entity.Property(e => e.Caption).HasColumnName("CAPTION").HasMaxLength(300);
                entity.Property(e => e.SortOrder).HasColumnName("SORTORDER");
                entity.Property(e => e.IsPrimary).HasColumnName("ISPRIMARY");
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.UploadedByUserId).HasColumnName("UPLOADEDBYUSERID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<CompanyImage>(entity =>
            {
                entity.ToTable("COMPANYIMAGES");
                entity.HasKey(e => e.CompanyImageId);
                entity.Property(e => e.CompanyImageId).HasColumnName("COMPANYIMAGEID");
                entity.Property(e => e.CompanyId).HasColumnName("COMPANYID");
                entity.Property(e => e.FilePath).HasColumnName("FILEPATH").HasMaxLength(500);
                entity.Property(e => e.FileName).HasColumnName("FILENAME").HasMaxLength(255);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.FileType).HasColumnName("FILETYPE").HasMaxLength(100);
                entity.Property(e => e.Caption).HasColumnName("CAPTION").HasMaxLength(300);
                entity.Property(e => e.SortOrder).HasColumnName("SORTORDER");
                entity.Property(e => e.IsPrimary).HasColumnName("ISPRIMARY");
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.UploadedByUserId).HasColumnName("UPLOADEDBYUSERID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            modelBuilder.Entity<JobImage>(entity =>
            {
                entity.ToTable("JOBIMAGES");
                entity.HasKey(e => e.JobImageId);
                entity.Property(e => e.JobImageId).HasColumnName("JOBIMAGEID");
                entity.Property(e => e.JobId).HasColumnName("JOBID");
                entity.Property(e => e.FilePath).HasColumnName("FILEPATH").HasMaxLength(500);
                entity.Property(e => e.FileName).HasColumnName("FILENAME").HasMaxLength(255);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.FileType).HasColumnName("FILETYPE").HasMaxLength(100);
                entity.Property(e => e.Caption).HasColumnName("CAPTION").HasMaxLength(300);
                entity.Property(e => e.SortOrder).HasColumnName("SORTORDER");
                entity.Property(e => e.IsPrimary).HasColumnName("ISPRIMARY");
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.UploadedByUserId).HasColumnName("UPLOADEDBYUSERID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            });

            // Resume configuration
            modelBuilder.Entity<Resume>(entity =>
            {
                entity.ToTable("RESUMES");
                entity.HasKey(e => e.ResumeId);
                entity.Property(e => e.ResumeId).HasColumnName("RESUMEID");
                entity.Property(e => e.CandidateId).HasColumnName("CANDIDATEID");
                entity.Property(e => e.Title).HasColumnName("TITLE").HasMaxLength(250);
                entity.Property(e => e.Content).HasColumnName("CONTENT");
                entity.Property(e => e.IsPublic).HasColumnName("ISPUBLIC");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
            });

            // Application configuration
            modelBuilder.Entity<Application>(entity =>
            {
                entity.ToTable("APPLICATIONS");
                entity.HasKey(e => e.ApplicationId);
                entity.Property(e => e.ApplicationId).HasColumnName("APPLICATIONID");
                entity.Property(e => e.JobId).HasColumnName("JOBID");
                entity.Property(e => e.CandidateId).HasColumnName("CANDIDATEID");
                entity.Property(e => e.ResumeId).HasColumnName("RESUMEID");
                entity.Property(e => e.Status).HasColumnName("STATUS").HasMaxLength(50);
                entity.Property(e => e.AppliedAt).HasColumnName("APPLIEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
                entity.Property(e => e.IsViewedByEmployer).HasColumnName("ISVIEWEDBYEMPLOYER");
                entity.Property(e => e.EmployerViewedAt).HasColumnName("EMPLOYERVIEWEDAT");

                // Unique constraint: một candidate chỉ có thể ứng tuyển một job một lần
                entity.HasIndex(e => new { e.JobId, e.CandidateId }).IsUnique();
            });

            // Notification configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("NOTIFICATIONS");
                entity.HasKey(e => e.NotificationId);
                entity.Property(e => e.NotificationId).HasColumnName("NOTIFICATIONID");
                entity.Property(e => e.UserId).HasColumnName("USERID").IsRequired();
                entity.Property(e => e.Type).HasColumnName("TYPE").IsRequired().HasMaxLength(50);
                entity.Property(e => e.Title).HasColumnName("TITLE").IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).HasColumnName("MESSAGE").IsRequired().HasMaxLength(1000);
                entity.Property(e => e.IsRead).HasColumnName("ISREAD");
                entity.Property(e => e.RelatedJobId).HasColumnName("RELATEDJOBID");
                entity.Property(e => e.RelatedApplicationId).HasColumnName("RELATEDAPPLICATIONID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
            });

            // Message configuration
            modelBuilder.Entity<Message>(entity =>
            {
                entity.ToTable("MESSAGES");
                entity.HasKey(e => e.MessageId);
                entity.Property(e => e.MessageId).HasColumnName("MESSAGEID");
                entity.Property(e => e.SenderUserId).HasColumnName("SENDERUSERID").IsRequired();
                entity.Property(e => e.ReceiverUserId).HasColumnName("RECEIVERUSERID").IsRequired();
                entity.Property(e => e.Subject).HasColumnName("SUBJECT").IsRequired().HasMaxLength(200);
                entity.Property(e => e.Content).HasColumnName("CONTENT").IsRequired().HasMaxLength(2000);
                entity.Property(e => e.IsRead).HasColumnName("ISREAD");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
            });

            // Blog configuration
            modelBuilder.Entity<Blog>(entity =>
            {
                entity.ToTable("BLOGS");
                entity.HasKey(e => e.BlogId);
                entity.Property(e => e.BlogId).HasColumnName("BLOGID");
                entity.Property(e => e.AuthorUserId).HasColumnName("AUTHORUSERID");
                entity.Property(e => e.Title).HasColumnName("TITLE").IsRequired().HasMaxLength(300);
                entity.Property(e => e.Content).HasColumnName("CONTENT").IsRequired();
                entity.Property(e => e.IsPublished).HasColumnName("ISPUBLISHED");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");
            
                entity.HasOne(b => b.Author)
                      .WithMany()
                      .HasForeignKey(b => b.AuthorUserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // BlogImage configuration
            modelBuilder.Entity<BlogImage>(entity =>
            {
                entity.ToTable("BLOGIMAGES");
                entity.HasKey(e => e.BlogImageId);
                entity.Property(e => e.BlogImageId).HasColumnName("BLOGIMAGEID");
                entity.Property(e => e.BlogId).HasColumnName("BLOGID");
                entity.Property(e => e.FilePath).HasColumnName("FILEPATH").IsRequired().HasMaxLength(500);
                entity.Property(e => e.FileName).HasColumnName("FILENAME").HasMaxLength(255);
                entity.Property(e => e.FileType).HasColumnName("FILETYPE").HasMaxLength(100);
                entity.Property(e => e.FileSize).HasColumnName("FILESIZE");
                entity.Property(e => e.Caption).HasColumnName("CAPTION").HasMaxLength(300);
                entity.Property(e => e.SortOrder).HasColumnName("SORTORDER");
                entity.Property(e => e.IsPrimary).HasColumnName("ISPRIMARY");
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.UploadedByUserId).HasColumnName("UPLOADEDBYUSERID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATEDAT");

                entity.HasOne(bi => bi.Blog)
                      .WithMany(b => b.Images)
                      .HasForeignKey(bi => bi.BlogId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
