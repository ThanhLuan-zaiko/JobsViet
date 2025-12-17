using Microsoft.EntityFrameworkCore;
using Server.Models.Jobs;
using Server.Data.Jobs;

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
            IQueryable<Job> query = _context.Jobs
                .Where(j => j.IsActive == 1)
                .Include(j => j.Company); // Include Company entity

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

        public async Task CreateJobAsync(Job job)
        {
            await _context.Jobs.AddAsync(job);
        }

        public async Task CreateJobImageAsync(JobImage jobImage)
        {
            await _context.JobImages.AddAsync(jobImage);
        }

        public async Task<JobImage?> GetJobImageByIdAsync(Guid imageId)
        {
            return await _context.JobImages.FindAsync(imageId);
        }

        public async Task UpdateJobImageAsync(JobImage jobImage)
        {
            _context.JobImages.Update(jobImage);
            await Task.CompletedTask;
        }

        public async Task<List<JobImage>> GetJobImagesByJobIdAsync(Guid jobId)
        {
            return await _context.JobImages
                .Where(ji => ji.JobId == jobId && ji.IsActive == 1)
                .OrderBy(ji => ji.SortOrder)
                .ToListAsync();
        }

        public async Task<Job?> GetJobByGuidAsync(Guid jobGuid)
        {
            return await _context.Jobs
                .Where(j => j.JobGuid == jobGuid && j.IsActive == 1)
                .Include(j => j.Company)
                .FirstOrDefaultAsync();
        }

        public async Task<Job?> GetJobByIdAsync(Guid jobId)
        {
            return await _context.Jobs
                .Where(j => j.JobId == jobId && j.IsActive == 1)
                .Include(j => j.Company)
                .FirstOrDefaultAsync();
        }

        public async Task DeleteJobImageAsync(JobImage jobImage)
        {
            _context.JobImages.Remove(jobImage);
            await Task.CompletedTask;
        }

        public async Task UpdateJobAsync(Job job)
        {
            _context.Jobs.Update(job);
            await Task.CompletedTask;
        }

        public async Task<List<Job>> GetJobsByUserIdAsync(Guid userId)
        {
            return await _context.Jobs
                .Where(j => j.PostedByUserId == userId)
                .Include(j => j.Company)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task DeleteJobAsync(Job job)
        {
            _context.Jobs.Remove(job);
            await Task.CompletedTask;
        }
    }
}
