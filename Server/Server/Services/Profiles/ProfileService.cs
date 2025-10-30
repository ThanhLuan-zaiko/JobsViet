using System.Net.Http;
using Server.Data.Profiles;
using Server.DTOs.Profiles;
using Server.Models.Profiles;

namespace Server.Services.Profiles
{
    public class ProfileService : IProfileService
    {
        private readonly IProfileUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ProfileService(IProfileUnitOfWork unitOfWork, HttpClient httpClient, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        // Candidate Profile
        public async Task<CandidateProfileDto?> GetCandidateProfileByUserIdAsync(Guid userId)
        {
            var profile = await _unitOfWork.ProfileRepository.GetCandidateProfileByUserIdAsync(userId);
            if (profile == null) return null;

            var images = await _unitOfWork.ProfileRepository.GetCandidateProfileImagesAsync(profile.CandidateId);

            return new CandidateProfileDto
            {
                CandidateId = profile.CandidateId,
                UserId = profile.UserId,
                FullName = profile.FullName,
                Phone = profile.Phone,
                Headline = profile.Headline,
                DateOfBirth = profile.DateOfBirth,
                Gender = profile.Gender,
                Address = profile.Address,
                EducationLevel = profile.EducationLevel,
                ExperienceYears = profile.ExperienceYears,
                Skills = profile.Skills,
                LinkedInProfile = profile.LinkedInProfile,
                PortfolioURL = profile.PortfolioURL,
                Bio = profile.Bio,
                CreatedAt = profile.CreatedAt,
                UpdatedAt = profile.UpdatedAt,
                Images = images.Select(img => new CandidateProfileImageDto
                {
                    ImageId = img.ImageId,
                    CandidateId = img.CandidateId,
                    ImageType = img.ImageType,
                    ImageUrl = img.ImageUrl,
                    OriginalFileName = img.OriginalFileName,
                    FileSize = img.FileSize,
                    MimeType = img.MimeType,
                    CreatedAt = img.CreatedAt,
                    UpdatedAt = img.UpdatedAt
                }).ToList()
            };
        }

        public async Task<CandidateProfileDto> CreateCandidateProfileAsync(Guid userId, CandidateProfileCreateDto dto)
        {
            // Check if profile already exists
            var existingProfile = await _unitOfWork.ProfileRepository.GetCandidateProfileByUserIdAsync(userId);
            if (existingProfile != null)
                throw new Exception("Candidate profile already exists for this user");

            var profile = new CandidateProfile
            {
                CandidateId = Guid.NewGuid(),
                UserId = userId,
                FullName = dto.FullName,
                Phone = dto.Phone,
                Headline = dto.Headline,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Address = dto.Address,
                EducationLevel = dto.EducationLevel,
                ExperienceYears = dto.ExperienceYears,
                Skills = dto.Skills,
                LinkedInProfile = dto.LinkedInProfile,
                PortfolioURL = dto.PortfolioURL,
                Bio = dto.Bio,
                CreatedAt = DateTime.UtcNow
            };

            var createdProfile = await _unitOfWork.ProfileRepository.CreateCandidateProfileAsync(profile);
            await _unitOfWork.SaveChangesAsync();
            return await GetCandidateProfileByUserIdAsync(userId) ?? throw new Exception("Failed to create candidate profile");
        }

        public async Task<CandidateProfileDto> UpdateCandidateProfileAsync(Guid userId, CandidateProfileUpdateDto dto)
        {
            var existingProfile = await _unitOfWork.ProfileRepository.GetCandidateProfileByUserIdAsync(userId);
            if (existingProfile == null)
                throw new Exception("Candidate profile not found");

            if (dto.FullName != null) existingProfile.FullName = dto.FullName;
            if (dto.Phone != null) existingProfile.Phone = dto.Phone;
            if (dto.Headline != null) existingProfile.Headline = dto.Headline;
            if (dto.DateOfBirth.HasValue) existingProfile.DateOfBirth = dto.DateOfBirth;
            if (dto.Gender != null) existingProfile.Gender = dto.Gender;
            if (dto.Address != null) existingProfile.Address = dto.Address;
            if (dto.EducationLevel != null) existingProfile.EducationLevel = dto.EducationLevel;
            if (dto.ExperienceYears.HasValue) existingProfile.ExperienceYears = dto.ExperienceYears;
            if (dto.Skills != null) existingProfile.Skills = dto.Skills;
            if (dto.LinkedInProfile != null) existingProfile.LinkedInProfile = dto.LinkedInProfile;
            if (dto.PortfolioURL != null) existingProfile.PortfolioURL = dto.PortfolioURL;
            if (dto.Bio != null) existingProfile.Bio = dto.Bio;
            existingProfile.UpdatedAt = DateTime.UtcNow;

            var updatedProfile = await _unitOfWork.ProfileRepository.UpdateCandidateProfileAsync(existingProfile);
            await _unitOfWork.SaveChangesAsync();
            return await GetCandidateProfileByUserIdAsync(userId) ?? throw new Exception("Failed to update candidate profile");
        }

        // Employer Profile
        public async Task<EmployerProfileDto?> GetEmployerProfileByUserIdAsync(Guid userId)
        {
            var profile = await _unitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
            if (profile == null) return null;

            var images = await _unitOfWork.ProfileRepository.GetEmployerProfileImagesAsync(profile.EmployerId);
            var companies = await _unitOfWork.ProfileRepository.GetCompaniesByEmployerIdAsync(profile.EmployerId);

            return new EmployerProfileDto
            {
                EmployerId = profile.EmployerId,
                UserId = profile.UserId,
                DisplayName = profile.DisplayName,
                ContactPhone = profile.ContactPhone,
                Bio = profile.Bio,
                Industry = profile.Industry,
                Position = profile.Position,
                YearsOfExperience = profile.YearsOfExperience,
                LinkedInProfile = profile.LinkedInProfile,
                Website = profile.Website,
                CreatedAt = profile.CreatedAt,
                UpdatedAt = profile.UpdatedAt,
                Images = images.Select(img => new EmployerProfileImageDto
                {
                    ImageId = img.ImageId,
                    EmployerId = img.EmployerId,
                    ImageType = img.ImageType,
                    ImageUrl = img.ImageUrl,
                    OriginalFileName = img.OriginalFileName,
                    FileSize = img.FileSize,
                    MimeType = img.MimeType,
                    CreatedAt = img.CreatedAt,
                    UpdatedAt = img.UpdatedAt
                }).ToList(),
                Companies = companies.Select(c => new CompanyDto
                {
                    CompanyId = c.CompanyId,
                    Name = c.Name ?? string.Empty,
                    Website = c.Website,
                    Description = c.Description,
                    Industry = c.Industry,
                    Size = c.Size,
                    FoundedYear = c.FoundedYear,
                    Address = c.Address,
                    ContactEmail = c.ContactEmail,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                }).ToList()
            };
        }

        public async Task<EmployerProfileDto> CreateEmployerProfileAsync(Guid userId, EmployerProfileCreateDto dto)
        {
            var profile = new EmployerProfile
            {
                EmployerId = Guid.NewGuid(),
                UserId = userId,
                DisplayName = dto.DisplayName,
                ContactPhone = dto.ContactPhone,
                Bio = dto.Bio,
                Industry = dto.Industry,
                Position = dto.Position,
                YearsOfExperience = dto.YearsOfExperience,
                LinkedInProfile = dto.LinkedInProfile,
                Website = dto.Website,
                CreatedAt = DateTime.UtcNow
            };

            var createdProfile = await _unitOfWork.ProfileRepository.CreateEmployerProfileAsync(profile);
            await _unitOfWork.SaveChangesAsync();
            return await GetEmployerProfileByUserIdAsync(userId) ?? throw new Exception("Failed to create employer profile");
        }

        public async Task<EmployerProfileDto> UpdateEmployerProfileAsync(Guid userId, EmployerProfileUpdateDto dto)
        {
            var existingProfile = await _unitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
            if (existingProfile == null)
                throw new Exception("Employer profile not found");

            if (dto.DisplayName != null) existingProfile.DisplayName = dto.DisplayName;
            if (dto.ContactPhone != null) existingProfile.ContactPhone = dto.ContactPhone;
            if (dto.Bio != null) existingProfile.Bio = dto.Bio;
            if (dto.Industry != null) existingProfile.Industry = dto.Industry;
            if (dto.Position != null) existingProfile.Position = dto.Position;
            if (dto.YearsOfExperience.HasValue) existingProfile.YearsOfExperience = dto.YearsOfExperience;
            if (dto.LinkedInProfile != null) existingProfile.LinkedInProfile = dto.LinkedInProfile;
            if (dto.Website != null) existingProfile.Website = dto.Website;
            existingProfile.UpdatedAt = DateTime.UtcNow;

            var updatedProfile = await _unitOfWork.ProfileRepository.UpdateEmployerProfileAsync(existingProfile);
            await _unitOfWork.SaveChangesAsync();
            return await GetEmployerProfileByUserIdAsync(userId) ?? throw new Exception("Failed to update employer profile");
        }

        // Company
        public async Task<CompanyDto> CreateCompanyAsync(CompanyCreateDto dto)
        {
            var company = new Company
            {
                CompanyId = Guid.NewGuid(),
                Name = dto.Name,
                Website = dto.Website,
                Description = dto.Description,
                Industry = dto.Industry,
                Size = dto.Size,
                FoundedYear = dto.FoundedYear,
                Address = dto.Address,
                ContactEmail = dto.ContactEmail,
                CreatedAt = DateTime.UtcNow
            };

            var createdCompany = await _unitOfWork.ProfileRepository.CreateCompanyAsync(company);
            await _unitOfWork.SaveChangesAsync();
            return new CompanyDto
            {
                CompanyId = createdCompany.CompanyId,
                Name = createdCompany.Name ?? string.Empty,
                Website = createdCompany.Website,
                Description = createdCompany.Description,
                Industry = createdCompany.Industry,
                Size = createdCompany.Size,
                FoundedYear = createdCompany.FoundedYear,
                Address = createdCompany.Address,
                ContactEmail = createdCompany.ContactEmail,
                CreatedAt = createdCompany.CreatedAt,
                UpdatedAt = createdCompany.UpdatedAt
            };
        }

        public async Task<CompanyDto> UpdateCompanyAsync(Guid companyId, CompanyUpdateDto dto)
        {
            var existingCompany = await _unitOfWork.ProfileRepository.GetCompanyByIdAsync(companyId);
            if (existingCompany == null)
                throw new Exception("Company not found");

            if (dto.Name != null) existingCompany.Name = dto.Name;
            if (dto.Website != null) existingCompany.Website = dto.Website;
            if (dto.Description != null) existingCompany.Description = dto.Description;
            if (dto.Industry != null) existingCompany.Industry = dto.Industry;
            if (dto.Size != null) existingCompany.Size = dto.Size;
            if (dto.FoundedYear.HasValue) existingCompany.FoundedYear = dto.FoundedYear;
            if (dto.Address != null) existingCompany.Address = dto.Address;
            if (dto.ContactEmail != null) existingCompany.ContactEmail = dto.ContactEmail;
            existingCompany.UpdatedAt = DateTime.UtcNow;

            var updatedCompany = await _unitOfWork.ProfileRepository.UpdateCompanyAsync(existingCompany);
            await _unitOfWork.SaveChangesAsync();
            return new CompanyDto
            {
                CompanyId = updatedCompany.CompanyId,
                Name = updatedCompany.Name ?? string.Empty,
                Website = updatedCompany.Website,
                Description = updatedCompany.Description,
                Industry = updatedCompany.Industry,
                Size = updatedCompany.Size,
                FoundedYear = updatedCompany.FoundedYear,
                Address = updatedCompany.Address,
                ContactEmail = updatedCompany.ContactEmail,
                CreatedAt = updatedCompany.CreatedAt,
                UpdatedAt = updatedCompany.UpdatedAt
            };
        }

        public async Task<CompanyDto?> GetCompanyByIdAsync(Guid companyId)
        {
            var company = await _unitOfWork.ProfileRepository.GetCompanyByIdAsync(companyId);
            if (company == null) return null;

            return new CompanyDto
            {
                CompanyId = company.CompanyId,
                Name = company.Name ?? string.Empty,
                Website = company.Website,
                Description = company.Description,
                Industry = company.Industry,
                Size = company.Size,
                FoundedYear = company.FoundedYear,
                Address = company.Address,
                ContactEmail = company.ContactEmail,
                CreatedAt = company.CreatedAt,
                UpdatedAt = company.UpdatedAt
            };
        }

        public async Task<List<CompanyDto>> GetCompaniesByEmployerIdAsync(Guid employerId)
        {
            var companies = await _unitOfWork.ProfileRepository.GetCompaniesByEmployerIdAsync(employerId);
            return companies.Select(c => new CompanyDto
            {
                CompanyId = c.CompanyId,
                Name = c.Name ?? string.Empty,
                Website = c.Website,
                Description = c.Description,
                Industry = c.Industry,
                Size = c.Size,
                FoundedYear = c.FoundedYear,
                Address = c.Address,
                ContactEmail = c.ContactEmail,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList();
        }

        // Images
        public async Task<CandidateProfileImageDto> UploadCandidateProfileImageAsync(Guid candidateId, CandidateProfileImageCreateDto dto)
        {
            var image = new CandidateProfileImage
            {
                ImageId = Guid.NewGuid(),
                CandidateId = candidateId,
                ImageType = dto.ImageType,
                ImageUrl = dto.ImageUrl,
                OriginalFileName = dto.OriginalFileName,
                FileSize = dto.FileSize,
                MimeType = dto.MimeType,
                CreatedAt = DateTime.UtcNow
            };

            var createdImage = await _unitOfWork.ProfileRepository.CreateCandidateProfileImageAsync(image);
            await _unitOfWork.SaveChangesAsync();
            return new CandidateProfileImageDto
            {
                ImageId = createdImage.ImageId,
                CandidateId = createdImage.CandidateId,
                ImageType = createdImage.ImageType,
                ImageUrl = createdImage.ImageUrl,
                OriginalFileName = createdImage.OriginalFileName,
                FileSize = createdImage.FileSize,
                MimeType = createdImage.MimeType,
                CreatedAt = createdImage.CreatedAt,
                UpdatedAt = createdImage.UpdatedAt
            };
        }

        public async Task<EmployerProfileImageDto> UploadEmployerProfileImageAsync(Guid employerId, EmployerProfileImageCreateDto dto)
        {
            var image = new EmployerProfileImage
            {
                ImageId = Guid.NewGuid(),
                EmployerId = employerId,
                ImageType = dto.ImageType,
                ImageUrl = dto.ImageUrl,
                OriginalFileName = dto.OriginalFileName,
                FileSize = dto.FileSize,
                MimeType = dto.MimeType,
                CreatedAt = DateTime.UtcNow
            };

            var createdImage = await _unitOfWork.ProfileRepository.CreateEmployerProfileImageAsync(image);
            await _unitOfWork.SaveChangesAsync();
            return new EmployerProfileImageDto
            {
                ImageId = createdImage.ImageId,
                EmployerId = createdImage.EmployerId,
                ImageType = createdImage.ImageType,
                ImageUrl = createdImage.ImageUrl,
                OriginalFileName = createdImage.OriginalFileName,
                FileSize = createdImage.FileSize,
                MimeType = createdImage.MimeType,
                CreatedAt = createdImage.CreatedAt,
                UpdatedAt = createdImage.UpdatedAt
            };
        }

        public async Task<CompanyImageDto> UploadCompanyImageAsync(Guid companyId, CompanyImageCreateDto dto)
        {
            var image = new CompanyImage
            {
                ImageId = Guid.NewGuid(),
                CompanyId = companyId,
                ImageType = dto.ImageType,
                ImageUrl = dto.ImageUrl,
                OriginalFileName = dto.OriginalFileName,
                FileSize = dto.FileSize,
                MimeType = dto.MimeType,
                CreatedAt = DateTime.UtcNow
            };

            var createdImage = await _unitOfWork.ProfileRepository.CreateCompanyImageAsync(image);
            await _unitOfWork.SaveChangesAsync();
            return new CompanyImageDto
            {
                ImageId = createdImage.ImageId,
                CompanyId = createdImage.CompanyId,
                ImageType = createdImage.ImageType,
                ImageUrl = createdImage.ImageUrl,
                OriginalFileName = createdImage.OriginalFileName,
                FileSize = createdImage.FileSize,
                MimeType = createdImage.MimeType,
                CreatedAt = createdImage.CreatedAt,
                UpdatedAt = createdImage.UpdatedAt
            };
        }

        public async Task<List<CandidateProfileImageDto>> GetCandidateProfileImagesAsync(Guid candidateId)
        {
            var images = await _unitOfWork.ProfileRepository.GetCandidateProfileImagesAsync(candidateId);
            return images.Select(img => new CandidateProfileImageDto
            {
                ImageId = img.ImageId,
                CandidateId = img.CandidateId,
                ImageType = img.ImageType,
                ImageUrl = img.ImageUrl,
                OriginalFileName = img.OriginalFileName,
                FileSize = img.FileSize,
                MimeType = img.MimeType,
                CreatedAt = img.CreatedAt,
                UpdatedAt = img.UpdatedAt
            }).ToList();
        }

        public async Task<List<EmployerProfileImageDto>> GetEmployerProfileImagesAsync(Guid employerId)
        {
            var images = await _unitOfWork.ProfileRepository.GetEmployerProfileImagesAsync(employerId);
            return images.Select(img => new EmployerProfileImageDto
            {
                ImageId = img.ImageId,
                EmployerId = img.EmployerId,
                ImageType = img.ImageType,
                ImageUrl = img.ImageUrl,
                OriginalFileName = img.OriginalFileName,
                FileSize = img.FileSize,
                MimeType = img.MimeType,
                CreatedAt = img.CreatedAt,
                UpdatedAt = img.UpdatedAt
            }).ToList();
        }

        public async Task<List<CompanyImageDto>> GetCompanyImagesAsync(Guid companyId)
        {
            var images = await _unitOfWork.ProfileRepository.GetCompanyImagesAsync(companyId);
            return images.Select(img => new CompanyImageDto
            {
                ImageId = img.ImageId,
                CompanyId = img.CompanyId,
                ImageType = img.ImageType,
                ImageUrl = img.ImageUrl,
                OriginalFileName = img.OriginalFileName,
                FileSize = img.FileSize,
                MimeType = img.MimeType,
                CreatedAt = img.CreatedAt,
                UpdatedAt = img.UpdatedAt
            }).ToList();
        }

        private class ImageUploadResponse
        {
            public string? image_url { get; set; }
            public string? file_name { get; set; }
            public long? file_size { get; set; }
            public string? mime_type { get; set; }
        }
    }
}
