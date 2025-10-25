using System;
using Server.Data.Jobs;
using Server.Models.Profiles;
using Microsoft.EntityFrameworkCore;

namespace Server.Data.Profiles
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly ApplicationDbContext _context;

        public ProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Candidate Profile
        public async Task<CandidateProfile?> GetCandidateProfileByUserIdAsync(Guid userId)
        {
            return await _context.CandidateProfiles
                .FirstOrDefaultAsync(cp => cp.UserId == userId);
        }

        public async Task<CandidateProfile> CreateCandidateProfileAsync(CandidateProfile profile)
        {
            _context.CandidateProfiles.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<CandidateProfile> UpdateCandidateProfileAsync(CandidateProfile profile)
        {
            _context.CandidateProfiles.Update(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        // Employer Profile
        public async Task<EmployerProfile?> GetEmployerProfileByUserIdAsync(Guid userId)
        {
            return await _context.EmployerProfiles
                .FirstOrDefaultAsync(ep => ep.UserId == userId);
        }

        public async Task<EmployerProfile> CreateEmployerProfileAsync(EmployerProfile profile)
        {
            _context.EmployerProfiles.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<EmployerProfile> UpdateEmployerProfileAsync(EmployerProfile profile)
        {
            _context.EmployerProfiles.Update(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        // Company
        public async Task<Company?> GetCompanyByIdAsync(Guid companyId)
        {
            return await _context.Companies.FindAsync(companyId);
        }

        public async Task<Company> CreateCompanyAsync(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
            return company;
        }

        public async Task<Company> UpdateCompanyAsync(Company company)
        {
            _context.Companies.Update(company);
            await _context.SaveChangesAsync();
            return company;
        }

        public async Task<List<Company>> GetCompaniesByEmployerIdAsync(Guid employerId)
        {
            return await _context.EmployerCompanies
                .Where(ec => ec.EmployerId == employerId)
                .Join(_context.Companies,
                    ec => ec.CompanyId,
                    c => c.CompanyId,
                    (ec, c) => c)
                .ToListAsync();
        }

        // Employer-Company relationship
        public async Task<EmployerCompany> CreateEmployerCompanyAsync(EmployerCompany employerCompany)
        {
            _context.EmployerCompanies.Add(employerCompany);
            await _context.SaveChangesAsync();
            return employerCompany;
        }

        public async Task<List<EmployerCompany>> GetEmployerCompaniesByEmployerIdAsync(Guid employerId)
        {
            return await _context.EmployerCompanies
                .Where(ec => ec.EmployerId == employerId)
                .ToListAsync();
        }

        // Images
        public async Task<CandidateProfileImage> CreateCandidateProfileImageAsync(CandidateProfileImage image)
        {
            _context.CandidateProfileImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<EmployerProfileImage> CreateEmployerProfileImageAsync(EmployerProfileImage image)
        {
            _context.EmployerProfileImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<CompanyImage> CreateCompanyImageAsync(CompanyImage image)
        {
            _context.CompanyImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<List<CandidateProfileImage>> GetCandidateProfileImagesAsync(Guid candidateId)
        {
            return await _context.CandidateProfileImages
                .Where(img => img.CandidateId == candidateId)
                .ToListAsync();
        }

        public async Task<List<EmployerProfileImage>> GetEmployerProfileImagesAsync(Guid employerId)
        {
            return await _context.EmployerProfileImages
                .Where(img => img.EmployerId == employerId)
                .ToListAsync();
        }

        public async Task<List<CompanyImage>> GetCompanyImagesAsync(Guid companyId)
        {
            return await _context.CompanyImages
                .Where(img => img.CompanyId == companyId)
                .ToListAsync();
        }
    }
}
