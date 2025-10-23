using Server.Data.Jobs;
using Server.DTOs.Jobs;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace Server.Services.Jobs
{
    public class JobCategoryService : IJobCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<JobCategoryService> _logger;

        public JobCategoryService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<JobCategoryService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<JobCategoryDto>> GetCategoriesAsync()
        {
            _logger.LogInformation("Fetching active job categories");

            var categories = await _unitOfWork.JobCategoryRepository.GetActiveCategoriesAsync();
            var categoryDtos = _mapper.Map<List<JobCategoryDto>>(categories);

            return categoryDtos;
        }
    }
}
