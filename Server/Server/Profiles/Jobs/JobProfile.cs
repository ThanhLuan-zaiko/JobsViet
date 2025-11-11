using AutoMapper;
using Server.DTOs.Jobs;
using Server.Models.Jobs;

namespace Server.Profiles.Jobs
{
    public class JobProfile : Profile
    {
        public JobProfile()
        {
            CreateMap<Job, JobDto>()
                .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Company != null ? src.Company.Name : null))
                .ForMember(dest => dest.CompanyLocation, opt => opt.MapFrom(src => src.Company != null ? src.Company.Address : null));
            CreateMap<JobCreateDto, Job>();
            CreateMap<JobCategory, JobCategoryDto>();
            CreateMap<JobImageCreateDto, JobImage>();
            CreateMap<JobImage, JobImageDto>();
        }
    }
}
