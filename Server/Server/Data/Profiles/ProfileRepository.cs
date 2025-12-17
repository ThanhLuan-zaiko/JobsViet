using System;
using Server.Models.Profiles;
using Microsoft.EntityFrameworkCore;
using Server.Data.Jobs;
using Server.Models.Auth;

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

        public async Task<CandidateProfile?> GetCandidateProfileByIdAsync(Guid candidateId)
        {
            return await _context.CandidateProfiles
                .FirstOrDefaultAsync(cp => cp.CandidateId == candidateId);
        }

        public async Task<CandidateProfile> CreateCandidateProfileAsync(CandidateProfile profile)
        {
            _context.CandidateProfiles.Add(profile);
            await _context.SaveChangesAsync();  // Thêm await để lưu thay đổi
            return profile;
        }

        public async Task<CandidateProfile> UpdateCandidateProfileAsync(CandidateProfile profile)
        {
            _context.CandidateProfiles.Update(profile);
            await _context.SaveChangesAsync();  // Thêm await để lưu thay đổi
            return profile;
        }

        // Employer Profile
        public async Task<EmployerProfile?> GetEmployerProfileByUserIdAsync(Guid userId)
        {
            return await _context.EmployerProfiles
                .FirstOrDefaultAsync(ep => ep.UserId == userId);
        }

        public async Task<EmployerProfile?> GetEmployerProfileByIdAsync(Guid employerId)
        {
            return await _context.EmployerProfiles.FindAsync(employerId);
        }

        public async Task<EmployerProfile> CreateEmployerProfileAsync(EmployerProfile profile)
        {
            _context.EmployerProfiles.Add(profile);
            await _context.SaveChangesAsync();  // Thêm await để lưu thay đổi
            return profile;
        }

        public async Task<EmployerProfile> UpdateEmployerProfileAsync(EmployerProfile profile)
        {
            _context.EmployerProfiles.Update(profile);
            await _context.SaveChangesAsync();  // Thêm await để lưu thay đổi
            return profile;
        }

        // Company
        public async Task<Company?> GetCompanyByIdAsync(Guid companyId)
        {
            return await _context.Companies.FindAsync(companyId);
        }

        public async Task<Company?> GetCompanyByNameAndUserIdAsync(string name, Guid userId)
        {
            return await _context.EmployerCompanies
                .Include(ec => ec.EmployerProfile)
                .Where(ec => ec.EmployerProfile != null && ec.EmployerProfile.UserId == userId)
                .Join(_context.Companies,
                    ec => ec.CompanyId,
                    c => c.CompanyId,
                    (ec, c) => c)
                .FirstOrDefaultAsync(c => c.Name == name);
        }

        public async Task<Company> CreateCompanyAsync(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();  // Thêm await để lưu thay đổi
            return company;
        }

        public async Task<Company> UpdateCompanyAsync(Company company)
        {
            _context.Companies.Update(company);
            await _context.SaveChangesAsync();  // Thêm await để lưu thay đổi
            return company;
        }

        public async Task DeleteCompanyAsync(Guid companyId)
        {
            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
                throw new Exception("Company not found");

            // Delete related EmployerCompany relationships
            var employerCompanies = await _context.EmployerCompanies
                .Where(ec => ec.CompanyId == companyId)
                .ToListAsync();
            _context.EmployerCompanies.RemoveRange(employerCompanies);

            // Delete related CompanyImages
            var companyImages = await _context.CompanyImages
                .Where(ci => ci.CompanyId == companyId)
                .ToListAsync();
            _context.CompanyImages.RemoveRange(companyImages);

            // Delete the company
            _context.Companies.Remove(company);

            await _context.SaveChangesAsync();
        }

        public async Task<List<Company>> GetCompaniesByEmployerIdAsync(Guid employerId)
        {
            return await _context.EmployerCompanies
                .Where(ec => ec.EmployerProfileId == employerId)
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
            await _context.SaveChangesAsync();  // Thêm await để lưu thay đổi
            return employerCompany;
        }

        public async Task<List<EmployerCompany>> GetEmployerCompaniesByEmployerIdAsync(Guid employerId)
        {
            return await _context.EmployerCompanies
                .Where(ec => ec.EmployerProfileId == employerId)
                .ToListAsync();
        }

        // Images
        public async Task<CandidateProfileImage> CreateCandidateProfileImageAsync(CandidateProfileImage image)
        {
            _context.CandidateProfileImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<CandidateProfileImage?> GetCandidateProfileImageByIdAsync(Guid imageId)
        {
            return await _context.CandidateProfileImages.FindAsync(imageId);
        }

        public async Task<CandidateProfileImage> UpdateCandidateProfileImageAsync(CandidateProfileImage image)
        {
            _context.CandidateProfileImages.Update(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<EmployerProfileImage> CreateEmployerProfileImageAsync(EmployerProfileImage image)
        {
            _context.EmployerProfileImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<EmployerProfileImage?> GetEmployerProfileImageByIdAsync(Guid imageId)
        {
            return await _context.EmployerProfileImages.FindAsync(imageId);
        }

        public async Task<EmployerProfileImage> UpdateEmployerProfileImageAsync(EmployerProfileImage image)
        {
            _context.EmployerProfileImages.Update(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<CompanyImage> CreateCompanyImageAsync(CompanyImage image)
        {
            _context.CompanyImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<CompanyImage?> GetCompanyImageByIdAsync(Guid imageId)
        {
            return await _context.CompanyImages.FindAsync(imageId);
        }

        public async Task<CompanyImage> UpdateCompanyImageAsync(CompanyImage image)
        {
            _context.CompanyImages.Update(image);
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

        // User
        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users.FindAsync(userId);
        }
        public async Task DeleteCandidateProfileImageAsync(CandidateProfileImage image)
        {
            _context.CandidateProfileImages.Remove(image);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmployerProfileImageAsync(EmployerProfileImage image)
        {
            _context.EmployerProfileImages.Remove(image);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCompanyImageAsync(CompanyImage image)
        {
            _context.CompanyImages.Remove(image);
            await _context.SaveChangesAsync();
        }

    }
}
