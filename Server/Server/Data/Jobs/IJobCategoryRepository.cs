using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public interface IJobCategoryRepository
    {
        Task<List<JobCategory>> GetActiveCategoriesAsync();
    }
}
