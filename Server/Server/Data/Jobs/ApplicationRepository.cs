using Microsoft.EntityFrameworkCore;
using Server.Models.Jobs;
using Server.Models.Profiles;

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

        public async Task<List<Application>> GetApplicationsByEmployerIdAsync(Guid employerId)
        {
            return await _context.Applications
                .Include(a => a.Job)
                .Where(a => a.Job != null && a.Job.EmployerProfileId == employerId)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();
        }

        public async Task<List<Application>> GetApplicationsByJobIdAsync(Guid jobId)
        {
            return await _context.Applications
                .Where(a => a.JobId == jobId)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();
        }

        public async Task<int> GetApplicationCountByJobIdAsync(Guid jobId)
        {
            return await _context.Applications
                .CountAsync(a => a.JobId == jobId);
        }

        public async Task<List<(Guid JobId, string JobTitle, int Count)>> GetApplicationCountsByEmployerIdAsync(Guid employerId)
        {
            var jobs = await _context.Jobs
                .Where(j => j.EmployerProfileId == employerId)
                .Select(j => new
                {
                    j.JobId,
                    j.Title,
                    Count = _context.Applications.Count(a => a.JobId == j.JobId)
                })
                .ToListAsync();

            return jobs.Select(j => (j.JobId, j.Title, j.Count)).ToList();
        }
    }
}

