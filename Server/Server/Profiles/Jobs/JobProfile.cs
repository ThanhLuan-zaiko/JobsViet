using AutoMapper;
using Server.DTOs.Jobs;
using Server.Models.Jobs;

namespace Server.Profiles.Jobs
{
    public class JobProfile : Profile
    {
        public JobProfile()
        {
            CreateMap<Job, JobDto>();
            CreateMap<JobCreateDto, Job>();
            CreateMap<JobCategory, JobCategoryDto>();
        }
    }
}
