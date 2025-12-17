using System;
using Server.Models.Profiles;

namespace Server.Data.Profiles
{
    public interface IProfileRepository
    {
        // Candidate Profile
        Task<CandidateProfile?> GetCandidateProfileByUserIdAsync(Guid userId);
        Task<CandidateProfile?> GetCandidateProfileByIdAsync(Guid candidateId);
        Task<CandidateProfile> CreateCandidateProfileAsync(CandidateProfile profile);
        Task<CandidateProfile> UpdateCandidateProfileAsync(CandidateProfile profile);

        // Employer Profile
        Task<EmployerProfile?> GetEmployerProfileByUserIdAsync(Guid userId);
        Task<EmployerProfile?> GetEmployerProfileByIdAsync(Guid employerId);
        Task<EmployerProfile> CreateEmployerProfileAsync(EmployerProfile profile);
        Task<EmployerProfile> UpdateEmployerProfileAsync(EmployerProfile profile);

        // Company
        Task<Company?> GetCompanyByIdAsync(Guid companyId);
        Task<Company?> GetCompanyByNameAndUserIdAsync(string name, Guid userId);
        Task<Company> CreateCompanyAsync(Company company);
        Task<Company> UpdateCompanyAsync(Company company);
        Task DeleteCompanyAsync(Guid companyId);
        Task<List<Company>> GetCompaniesByEmployerIdAsync(Guid employerId);

        // Employer-Company relationship
        Task<EmployerCompany> CreateEmployerCompanyAsync(EmployerCompany employerCompany);
        Task<List<EmployerCompany>> GetEmployerCompaniesByEmployerIdAsync(Guid employerId);

        // Images
        Task<CandidateProfileImage> CreateCandidateProfileImageAsync(CandidateProfileImage image);
        Task<CandidateProfileImage?> GetCandidateProfileImageByIdAsync(Guid imageId);
        Task<CandidateProfileImage> UpdateCandidateProfileImageAsync(CandidateProfileImage image);
        Task<EmployerProfileImage> CreateEmployerProfileImageAsync(EmployerProfileImage image);
        Task<EmployerProfileImage?> GetEmployerProfileImageByIdAsync(Guid imageId);
        Task<EmployerProfileImage> UpdateEmployerProfileImageAsync(EmployerProfileImage image);
        Task<CompanyImage> CreateCompanyImageAsync(CompanyImage image);
        Task<CompanyImage?> GetCompanyImageByIdAsync(Guid imageId);
        Task<CompanyImage> UpdateCompanyImageAsync(CompanyImage image);
        Task<List<CandidateProfileImage>> GetCandidateProfileImagesAsync(Guid candidateId);
        Task<List<EmployerProfileImage>> GetEmployerProfileImagesAsync(Guid employerId);
        Task<List<CompanyImage>> GetCompanyImagesAsync(Guid companyId);
        Task DeleteCandidateProfileImageAsync(CandidateProfileImage image);
        Task DeleteEmployerProfileImageAsync(EmployerProfileImage image);
        Task DeleteCompanyImageAsync(CompanyImage image);

        // User
        Task<Server.Models.Auth.User?> GetUserByIdAsync(Guid userId);
    }
}
