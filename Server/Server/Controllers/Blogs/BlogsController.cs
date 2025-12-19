using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.DTOs.Blogs;
using Server.Services.Blogs;
using System.Security.Claims;

namespace Server.Controllers.Blogs
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogsController : ControllerBase
    {
        private readonly IBlogService _blogService;
        private readonly ILogger<BlogsController> _logger;

        public BlogsController(IBlogService blogService, ILogger<BlogsController> logger)
        {
            _blogService = blogService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogDto>>> GetBlogs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var blogs = await _blogService.GetAllBlogsAsync(page, pageSize);
            var totalCount = await _blogService.GetTotalBlogsCountAsync();
            
            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            return Ok(blogs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BlogDto>> GetBlog(Guid id)
        {
            var blog = await _blogService.GetBlogByIdAsync(id);
            if (blog == null) return NotFound();
            return Ok(blog);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BlogDto>> CreateBlog([FromBody] CreateBlogDto createBlogDto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var blog = await _blogService.CreateBlogAsync(userId, createBlogDto);
            return CreatedAtAction(nameof(GetBlog), new { id = blog.BlogId }, blog);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<BlogDto>> UpdateBlog(Guid id, [FromBody] UpdateBlogDto updateBlogDto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                var blog = await _blogService.UpdateBlogAsync(id, userId, updateBlogDto);
                if (blog == null) return NotFound();
                return Ok(blog);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBlog(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                var result = await _blogService.DeleteBlogAsync(id, userId);
                if (!result) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPost("{id}/images")]
        [Authorize]
        public async Task<ActionResult<BlogImageDto>> UploadBlogImage(Guid id, [FromBody] BlogImageCreateDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
             try
            {
                dto.UploadedByUserId = userId; // Ensure user ID is correct
                var image = await _blogService.UploadBlogImageAsync(id, userId, dto);
                return Ok(image);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("images/{imageId}")]
        [Authorize]
        public async Task<IActionResult> DeleteBlogImage(Guid imageId)
        {
             var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
             try
            {
                var result = await _blogService.DeleteBlogImageAsync(imageId, userId);
                if (!result) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }
    }
}
