using Server.DTOs.Jobs;

namespace Server.Services.Jobs
{
    public interface IJobCategoryService
    {
        Task<List<JobCategoryDto>> GetCategoriesAsync();
    }
}
