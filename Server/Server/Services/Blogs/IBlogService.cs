using Server.DTOs.Blogs;

namespace Server.Services.Blogs
{
    public interface IBlogService
    {
        Task<IEnumerable<BlogDto>> GetAllBlogsAsync(int page, int pageSize);
        Task<int> GetTotalBlogsCountAsync();
        Task<BlogDto?> GetBlogByIdAsync(Guid id);
        Task<BlogDto> CreateBlogAsync(Guid userId, CreateBlogDto createBlogDto);
        Task<BlogDto?> UpdateBlogAsync(Guid blogId, Guid userId, UpdateBlogDto updateBlogDto);
        Task<bool> DeleteBlogAsync(Guid blogId, Guid userId); // userId for ownership check
        Task<BlogImageDto> UploadBlogImageAsync(Guid blogId, Guid userId, BlogImageCreateDto dto);
        Task<bool> DeleteBlogImageAsync(Guid imageId, Guid userId);
    }
}
