using AutoMapper;
using Server.DTOs.Profiles;
using Server.Models.Profiles;

namespace Server.Profiles
{
    public class ProfilesProfile : Profile
    {
        public ProfilesProfile()
        {
            CreateMap<Company, CompanyDto>();
            CreateMap<CompanyCreateDto, Company>();
            CreateMap<CompanyUpdateDto, Company>();

            CreateMap<EmployerProfile, EmployerProfileDto>();
            CreateMap<EmployerProfileCreateDto, EmployerProfile>()
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position));
            CreateMap<EmployerProfileUpdateDto, EmployerProfile>()
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position));

            CreateMap<CandidateProfile, CandidateProfileDto>();
            CreateMap<CandidateProfileCreateDto, CandidateProfile>();
            CreateMap<CandidateProfileUpdateDto, CandidateProfile>();

            CreateMap<EmployerProfileImage, EmployerProfileImageDto>();
            CreateMap<EmployerProfileImageCreateDto, EmployerProfileImage>();
            CreateMap<EmployerProfileImageUpdateDto, EmployerProfileImage>();

            CreateMap<CandidateProfileImage, CandidateProfileImageDto>();
            CreateMap<CandidateProfileImageCreateDto, CandidateProfileImage>();
            CreateMap<CandidateProfileImageUpdateDto, CandidateProfileImage>();

            CreateMap<CompanyImage, CompanyImageDto>();
            CreateMap<CompanyImageCreateDto, CompanyImage>();
            CreateMap<CompanyImageUpdateDto, CompanyImage>();
        }
    }
}
