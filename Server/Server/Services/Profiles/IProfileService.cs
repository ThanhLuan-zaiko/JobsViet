using Server.DTOs.Profiles;

namespace Server.Services.Profiles
{
    public interface IProfileService
    {
        // Candidate Profile
        Task<CandidateProfileDto?> GetCandidateProfileByUserIdAsync(Guid userId);
        Task<CandidateProfileDto> CreateCandidateProfileAsync(Guid userId, CandidateProfileCreateDto dto);
        Task<CandidateProfileDto> UpdateCandidateProfileAsync(Guid userId, CandidateProfileUpdateDto dto);

        // Employer Profile
        Task<EmployerProfileDto?> GetEmployerProfileByUserIdAsync(Guid userId);
        Task<EmployerProfileDto> CreateEmployerProfileAsync(Guid userId, EmployerProfileCreateDto dto);
        Task<EmployerProfileDto> UpdateEmployerProfileAsync(Guid userId, EmployerProfileUpdateDto dto);

        // Company
        Task<CompanyDto> CreateCompanyAsync(CompanyCreateDto dto);
        Task<CompanyDto> UpdateCompanyAsync(Guid companyId, CompanyUpdateDto dto);
        Task<CompanyDto?> GetCompanyByIdAsync(Guid companyId);
        Task<List<CompanyDto>> GetCompaniesByEmployerIdAsync(Guid employerId);

        // Images
        Task<CandidateProfileImageDto> UploadCandidateProfileImageAsync(Guid candidateId, CandidateProfileImageCreateDto dto);
        Task<EmployerProfileImageDto> UploadEmployerProfileImageAsync(Guid employerId, EmployerProfileImageCreateDto dto);
        Task<CompanyImageDto> UploadCompanyImageAsync(Guid companyId, CompanyImageCreateDto dto);
        Task<List<CandidateProfileImageDto>> GetCandidateProfileImagesAsync(Guid candidateId);
        Task<List<EmployerProfileImageDto>> GetEmployerProfileImagesAsync(Guid employerId);
        Task<List<CompanyImageDto>> GetCompanyImagesAsync(Guid companyId);
    }
}
