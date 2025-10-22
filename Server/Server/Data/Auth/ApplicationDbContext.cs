using Microsoft.EntityFrameworkCore;
using Server.Models.Auth;

namespace Server.Data.Auth
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("USERS");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("USERID");
                entity.Property(e => e.UserName).HasColumnName("USERNAME").IsRequired().HasMaxLength(200);
                entity.Property(e => e.Email).HasColumnName("EMAIL").IsRequired().HasMaxLength(200);
                entity.Property(e => e.PasswordHash).HasColumnName("PASSWORDHASH").IsRequired().HasMaxLength(256);
                entity.Property(e => e.Role).HasColumnName("ROLE").IsRequired().HasMaxLength(50);
                entity.Property(e => e.IsActive).HasColumnName("ISACTIVE");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATEDAT");
            });
        }
    }
}
