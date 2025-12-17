using Server.Data.Jobs;
using Microsoft.EntityFrameworkCore.Storage;

namespace Server.Data.Profiles
{
    public interface IProfileUnitOfWork
    {
        IProfileRepository ProfileRepository { get; }
        Task SaveChangesAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
    }

    public class ProfileUnitOfWork : IProfileUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private readonly IProfileRepository _profileRepository;

        public ProfileUnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            _profileRepository = new ProfileRepository(context);
        }

        public IProfileRepository ProfileRepository => _profileRepository;

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
    }
}
