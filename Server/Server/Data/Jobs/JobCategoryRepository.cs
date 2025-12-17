using Server.Models.Jobs;
using Microsoft.EntityFrameworkCore;
using Server.Data.Jobs;

namespace Server.Data.Jobs
{
    public class JobCategoryRepository : IJobCategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public JobCategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<JobCategory>> GetActiveCategoriesAsync()
        {
            return await _context.JobCategories
                .Where(c => c.IsActive == 1)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }
    }
}
