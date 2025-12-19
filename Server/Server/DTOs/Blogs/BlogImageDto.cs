namespace Server.DTOs.Blogs
{
    public class BlogImageDto
    {
        public Guid BlogImageId { get; set; }
        public Guid BlogId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public bool IsPrimary { get; set; }
        public int SortOrder { get; set; }
    }
}
