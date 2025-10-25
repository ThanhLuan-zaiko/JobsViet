using System;
using Server.Models.Profiles;

namespace Server.Data.Profiles
{
    public interface IProfileRepository
    {
        // Candidate Profile
        Task<CandidateProfile?> GetCandidateProfileByUserIdAsync(Guid userId);
        Task<CandidateProfile> CreateCandidateProfileAsync(CandidateProfile profile);
        Task<CandidateProfile> UpdateCandidateProfileAsync(CandidateProfile profile);

        // Employer Profile
        Task<EmployerProfile?> GetEmployerProfileByUserIdAsync(Guid userId);
        Task<EmployerProfile> CreateEmployerProfileAsync(EmployerProfile profile);
        Task<EmployerProfile> UpdateEmployerProfileAsync(EmployerProfile profile);

        // Company
        Task<Company?> GetCompanyByIdAsync(Guid companyId);
        Task<Company> CreateCompanyAsync(Company company);
        Task<Company> UpdateCompanyAsync(Company company);
        Task<List<Company>> GetCompaniesByEmployerIdAsync(Guid employerId);

        // Employer-Company relationship
        Task<EmployerCompany> CreateEmployerCompanyAsync(EmployerCompany employerCompany);
        Task<List<EmployerCompany>> GetEmployerCompaniesByEmployerIdAsync(Guid employerId);

        // Images
        Task<CandidateProfileImage> CreateCandidateProfileImageAsync(CandidateProfileImage image);
        Task<EmployerProfileImage> CreateEmployerProfileImageAsync(EmployerProfileImage image);
        Task<CompanyImage> CreateCompanyImageAsync(CompanyImage image);
        Task<List<CandidateProfileImage>> GetCandidateProfileImagesAsync(Guid candidateId);
        Task<List<EmployerProfileImage>> GetEmployerProfileImagesAsync(Guid employerId);
        Task<List<CompanyImage>> GetCompanyImagesAsync(Guid companyId);
    }
}
