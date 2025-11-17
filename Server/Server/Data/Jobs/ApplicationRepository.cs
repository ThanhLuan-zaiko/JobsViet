using Microsoft.EntityFrameworkCore;
using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public class ApplicationRepository : IApplicationRepository
    {
        private readonly ApplicationDbContext _context;

        public ApplicationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Application?> GetApplicationByJobIdAndCandidateIdAsync(Guid jobId, Guid candidateId)
        {
            return await _context.Applications
                .FirstOrDefaultAsync(a => a.JobId == jobId && a.CandidateId == candidateId);
        }

        public async Task<Application> CreateApplicationAsync(Application application)
        {
            _context.Applications.Add(application);
            await _context.SaveChangesAsync();
            return application;
        }

        public async Task<bool> HasApplicationAsync(Guid jobId, Guid candidateId)
        {
            return await _context.Applications
                .AnyAsync(a => a.JobId == jobId && a.CandidateId == candidateId);
        }
    }
}

