using System.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace Server.Data.Jobs
{
    public interface IUnitOfWork : IDisposable
    {
        IJobRepository JobRepository { get; }
        IJobCategoryRepository JobCategoryRepository { get; }
        IApplicationRepository ApplicationRepository { get; }
        IResumeRepository ResumeRepository { get; }
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }

    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            JobRepository = new JobRepository(_context);
            JobCategoryRepository = new JobCategoryRepository(_context);
            ApplicationRepository = new ApplicationRepository(_context);
            ResumeRepository = new ResumeRepository(_context);
        }

        public IJobRepository JobRepository { get; }
        public IJobCategoryRepository JobCategoryRepository { get; }
        public IApplicationRepository ApplicationRepository { get; }
        public IResumeRepository ResumeRepository { get; }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _context.Dispose();
            if (_transaction != null)
            {
                _transaction.Dispose();
            }
        }
    }
}
