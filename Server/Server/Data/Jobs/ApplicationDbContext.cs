using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Models.Auth;
using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobCategory> JobCategories { get; set; }

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
        }
    }
}
