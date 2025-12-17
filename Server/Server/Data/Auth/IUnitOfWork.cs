using Server.Data.Jobs;
using Server.Data.Auth;

namespace Server.Data.Auth
{
    public interface IUnitOfWork : IDisposable
    {
        ApplicationDbContext Context { get; }
        Task<int> SaveChangesAsync();
    }
}
