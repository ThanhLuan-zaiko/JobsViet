using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Server.Data.Jobs;
using Server.DTOs.Blogs;
using Server.Models.Blogs;

namespace Server.Services.Blogs
{
    public class BlogService : IBlogService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<BlogService> _logger;

        public BlogService(ApplicationDbContext context, IMapper mapper, IWebHostEnvironment environment, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<BlogService> logger)
        {
            _context = context;
            _mapper = mapper;
            _environment = environment;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        // ... existing methods ...

        public async Task<IEnumerable<BlogDto>> GetAllBlogsAsync(int page, int pageSize)
        {
            var blogs = await _context.Blogs
                .Include(b => b.Author)
                .Include(b => b.Images)
                .Where(b => b.IsPublished)
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BlogDto>>(blogs);
        }

        public async Task<int> GetTotalBlogsCountAsync()
        {
            return await _context.Blogs.CountAsync(b => b.IsPublished);
        }

        public async Task<BlogDto?> GetBlogByIdAsync(Guid id)
        {
            var blog = await _context.Blogs
                .Include(b => b.Author)
                .Include(b => b.Images)
                .FirstOrDefaultAsync(b => b.BlogId == id);

            if (blog == null) return null;

            return _mapper.Map<BlogDto>(blog);
        }

        public async Task<BlogDto> CreateBlogAsync(Guid userId, CreateBlogDto createBlogDto)
        {
            var blog = _mapper.Map<Blog>(createBlogDto);
            blog.AuthorUserId = userId;
            blog.CreatedAt = DateTime.Now;

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<BlogDto>(blog);
        }

        public async Task<BlogDto?> UpdateBlogAsync(Guid blogId, Guid userId, UpdateBlogDto updateBlogDto)
        {
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog == null) return null;

            if (blog.AuthorUserId != userId) 
                throw new UnauthorizedAccessException("You are not the author of this blog.");

            _mapper.Map(updateBlogDto, blog);
            blog.UpdatedAt = DateTime.Now;

            _context.Blogs.Update(blog);
            await _context.SaveChangesAsync();

            return _mapper.Map<BlogDto>(blog);
        }

        public async Task<bool> DeleteBlogAsync(Guid blogId, Guid userId)
        {
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog == null) return false;

            if (blog.AuthorUserId != userId)
                throw new UnauthorizedAccessException("You are not the author of this blog.");

            var blogWithImages = await _context.Blogs.Include(b => b.Images).FirstOrDefaultAsync(b => b.BlogId == blogId);
            if (blogWithImages != null)
            {
                foreach (var img in blogWithImages.Images)
                {
                    try 
                    {
                        var imagesServiceUrl = _configuration["ImagesService:Url"] ?? "http://127.0.0.1:8000";
                        var client = _httpClientFactory.CreateClient();
                        var deleteUrl = $"{imagesServiceUrl}{img.FilePath}";
                        await client.DeleteAsync(deleteUrl);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error deleting physical blog image file");
                    }
                }
            }

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BlogImageDto> UploadBlogImageAsync(Guid blogId, Guid userId, BlogImageCreateDto dto)
        {
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog == null) throw new KeyNotFoundException("Blog not found");
            
            if (blog.AuthorUserId != userId)
                throw new UnauthorizedAccessException("You are not the author of this blog.");

            var blogImage = _mapper.Map<BlogImage>(dto);
            blogImage.BlogId = blogId;
            blogImage.UploadedByUserId = userId;
            blogImage.CreatedAt = DateTime.Now;

            // If this is primary, unset others for this blog
            if (dto.IsPrimary)
            {
                var existingPrimary = await _context.BlogImages
                    .Where(bi => bi.BlogId == blogId && bi.IsPrimary)
                    .ToListAsync();
                foreach (var img in existingPrimary)
                {
                    img.IsPrimary = false;
                }
            }

            _context.BlogImages.Add(blogImage);
            await _context.SaveChangesAsync();

            return _mapper.Map<BlogImageDto>(blogImage);
        }

        public async Task<bool> DeleteBlogImageAsync(Guid imageId, Guid userId)
        {
             var image = await _context.BlogImages.Include(bi => bi.Blog).FirstOrDefaultAsync(bi => bi.BlogImageId == imageId);
             if (image == null) return false;

             if (image.UploadedByUserId != userId && image.Blog.AuthorUserId != userId)
                 throw new UnauthorizedAccessException("You don't have permission to delete this image.");

             // Delete physical file from Python service
             try 
             {
                 var imagesServiceUrl = _configuration["ImagesService:Url"] ?? "http://127.0.0.1:8000";
                 var client = _httpClientFactory.CreateClient();
                 var deleteUrl = $"{imagesServiceUrl}{image.FilePath}";
                 var response = await client.DeleteAsync(deleteUrl);

                 if (!response.IsSuccessStatusCode)
                 {
                     _logger.LogWarning("Failed to delete physical blog image file: {Url}. Status: {Status}", deleteUrl, response.StatusCode);
                 }
             }
             catch (Exception ex)
             {
                 _logger.LogError(ex, "Error deleting physical blog image file");
             }

             _context.BlogImages.Remove(image);
             await _context.SaveChangesAsync();
             return true;
        }
    }
}
