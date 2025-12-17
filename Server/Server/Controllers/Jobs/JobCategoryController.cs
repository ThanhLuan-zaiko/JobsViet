using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Server.Services.Jobs;
using Microsoft.AspNetCore.Mvc.Versioning;

namespace Server.Controllers.Jobs
{
    [ApiController]
    [Route("api/v{version:apiVersion}/categories")]
    [ApiVersion("1.0")]
    public class JobCategoryController : ControllerBase
    {
        private readonly IJobCategoryService _jobCategoryService;
        private readonly ILogger<JobCategoryController> _logger;

        public JobCategoryController(IJobCategoryService jobCategoryService, ILogger<JobCategoryController> logger)
        {
            _jobCategoryService = jobCategoryService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _jobCategoryService.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching job categories");
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
