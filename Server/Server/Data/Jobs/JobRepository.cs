using Microsoft.EntityFrameworkCore;
using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public class JobRepository : IJobRepository
    {
        private readonly ApplicationDbContext _context;

        public JobRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Job>> GetAllJobsAsync()
        {
            return await _context.Jobs
                .Where(j => j.IsActive == 1)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task<(List<Job> Jobs, int TotalCount)> GetJobsAsync(int page, int pageSize, string? search, string? category)
        {
            IQueryable<Job> query = _context.Jobs.Where(j => j.IsActive == 1);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(j => j.Title.Contains(search));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(j => j.SkillsRequired != null && j.SkillsRequired.Contains(category));
            }

            var totalCount = await query.CountAsync();

            var jobs = await query
                .OrderByDescending(j => j.CreatedAt)
                .ThenBy(j => j.JobId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (jobs, totalCount);
        }
    }
}
