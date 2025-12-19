using AutoMapper;
using Server.DTOs.Blogs;
using Server.Models.Blogs;

namespace Server.Profiles
{
    public class BlogProfile : Profile
    {
        public BlogProfile()
        {
            CreateMap<Blog, BlogDto>()
                .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author.UserName)) // Assuming UserName is the name we want
                .ForMember(dest => dest.AuthorAvatar, opt => opt.MapFrom(src => "")) // Placeholder for now or connect to User Profile image if exists
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images));

            CreateMap<CreateBlogDto, Blog>();
            CreateMap<UpdateBlogDto, Blog>();

            CreateMap<BlogImage, BlogImageDto>();
            CreateMap<BlogImageCreateDto, BlogImage>();
        }
    }
}
