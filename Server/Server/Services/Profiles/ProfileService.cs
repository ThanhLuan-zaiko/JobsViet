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

    private string GenerateCompanyCode()
    {
        // Generate a unique 8-character code using GUID
        return Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
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
                    FilePath = img.FilePath,
                    FileName = img.FileName,
                    FileSize = img.FileSize,
                    FileType = img.FileType,
                    Caption = img.Caption,
                    SortOrder = img.SortOrder,
                    IsPrimary = img.IsPrimary,
                    IsActive = img.IsActive,
                    UploadedByUserId = img.UploadedByUserId,
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
                    FilePath = img.FilePath,
                    FileName = img.FileName,
                    FileSize = img.FileSize,
                    FileType = img.FileType,
                    Caption = img.Caption,
                    SortOrder = img.SortOrder,
                    IsPrimary = img.IsPrimary,
                    IsActive = img.IsActive,
                    UploadedByUserId = img.UploadedByUserId,
                    CreatedAt = img.CreatedAt,
                    UpdatedAt = img.UpdatedAt
                }).ToList(),
                Companies = companies.Select(c => new CompanyDto
                {
                    CompanyId = c.CompanyId,
                    Name = c.Name ?? string.Empty,
                    CompanyCode = c.CompanyCode,
                    Website = c.Website,
                    Description = c.Description,
                    Industry = c.Industry,
                    CompanySize = c.CompanySize,
                    FoundedYear = c.FoundedYear,
                    LogoURL = c.LogoURL,
                    Address = c.Address,
                    ContactEmail = c.ContactEmail,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Images = null // Will be populated in GetCompaniesByEmployerIdAsync if needed
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

            // Create companies if provided
            if (dto.Companies != null && dto.Companies.Any())
            {
                foreach (var companyDto in dto.Companies)
                {
                    var company = new Company
                    {
                        CompanyId = Guid.NewGuid(),
                        Name = companyDto.Name,
                        CompanyCode = companyDto.CompanyCode,
                        Website = companyDto.Website,
                        Description = companyDto.Description,
                        Industry = companyDto.Industry,
                        CompanySize = companyDto.CompanySize,
                        FoundedYear = companyDto.FoundedYear,
                        LogoURL = companyDto.LogoURL,
                        Address = companyDto.Address,
                        ContactEmail = companyDto.ContactEmail,
                        CreatedAt = DateTime.UtcNow
                    };

                    var createdCompany = await _unitOfWork.ProfileRepository.CreateCompanyAsync(company);

                    // Create employer-company relationship
                    var employerCompany = new EmployerCompany
                    {
                        Id = Guid.NewGuid(),
                        EmployerProfileId = createdProfile.EmployerId,
                        CompanyId = createdCompany.CompanyId,
                        Role = companyDto.Role,
                        IsPrimary = companyDto.IsPrimary
                    };

                    await _unitOfWork.ProfileRepository.CreateEmployerCompanyAsync(employerCompany);

                    // Upload company images if provided
                    if (companyDto.Images != null && companyDto.Images.Any())
                    {
                        foreach (var imageFile in companyDto.Images)
                        {
                            try
                            {
                                // Upload to image service
                                var imageUploadResponse = await UploadImageToServiceAsync(createdCompany.CompanyId.ToString(), imageFile);

                                // Save metadata to database
                                var companyImage = new CompanyImage
                                {
                                    CompanyImageId = Guid.NewGuid(),
                                    CompanyId = createdCompany.CompanyId,
                                    ImageType = "company",
                                    FilePath = imageUploadResponse.image_url ?? string.Empty,
                                    FileName = imageUploadResponse.file_name ?? string.Empty,
                                    FileSize = (long)(imageUploadResponse.file_size ?? 0),
                                    FileType = imageUploadResponse.mime_type ?? string.Empty,
                                    Caption = null,
                                    SortOrder = 0,
                                    IsPrimary = false,
                                    IsActive = true,
                                    UploadedByUserId = userId,
                                    CreatedAt = DateTime.UtcNow
                                };

                                await _unitOfWork.ProfileRepository.CreateCompanyImageAsync(companyImage);
                            }
                            catch (Exception ex)
                            {
                                // Log error but continue with other images
                                Console.WriteLine($"Error uploading company image: {ex.Message}");
                            }
                        }
                    }
                }
            }

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
                CompanyCode = dto.CompanyCode ?? GenerateCompanyCode(),
                Website = dto.Website,
                Description = dto.Description,
                Industry = dto.Industry,
                CompanySize = dto.CompanySize,
                FoundedYear = dto.FoundedYear,
                Address = dto.Address,
                ContactEmail = dto.ContactEmail,
                CreatedAt = DateTime.UtcNow
            };

            var createdCompany = await _unitOfWork.ProfileRepository.CreateCompanyAsync(company);
            await _unitOfWork.SaveChangesAsync();

            // If EmployerId is provided, create the EmployerCompany relationship
            if (dto.EmployerId.HasValue)
            {
                var employerCompany = new EmployerCompany
                {
                    Id = Guid.NewGuid(),
                    EmployerProfileId = dto.EmployerId.Value,
                    CompanyId = createdCompany.CompanyId,
                    Role = "Owner", // Default role
                    IsPrimary = true
                };

                await _unitOfWork.ProfileRepository.CreateEmployerCompanyAsync(employerCompany);
                await _unitOfWork.SaveChangesAsync();
            }

            return new CompanyDto
            {
                CompanyId = createdCompany.CompanyId,
                Name = createdCompany.Name ?? string.Empty,
                CompanyCode = createdCompany.CompanyCode,
                Website = createdCompany.Website,
                Description = createdCompany.Description,
                Industry = createdCompany.Industry,
                CompanySize = createdCompany.CompanySize,
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
            if (dto.CompanySize != null) existingCompany.CompanySize = dto.CompanySize;
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
                CompanyCode = updatedCompany.CompanyCode,
                Website = updatedCompany.Website,
                Description = updatedCompany.Description,
                Industry = updatedCompany.Industry,
                CompanySize = updatedCompany.CompanySize,
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

            var images = await _unitOfWork.ProfileRepository.GetCompanyImagesAsync(companyId);

            return new CompanyDto
            {
                CompanyId = company.CompanyId,
                Name = company.Name ?? string.Empty,
                CompanyCode = company.CompanyCode,
                Website = company.Website,
                Description = company.Description,
                Industry = company.Industry,
                CompanySize = company.CompanySize,
                FoundedYear = company.FoundedYear,
                LogoURL = company.LogoURL,
                Address = company.Address,
                ContactEmail = company.ContactEmail,
                CreatedAt = company.CreatedAt,
                UpdatedAt = company.UpdatedAt,
                Images = images.Select(img => new CompanyImageDto
                {
                    CompanyImageId = img.CompanyImageId,
                    CompanyId = img.CompanyId,
                    ImageType = img.ImageType,
                    FilePath = img.FilePath,
                    FileName = img.FileName,
                    FileSize = img.FileSize,
                    FileType = img.FileType,
                    Caption = img.Caption,
                    SortOrder = img.SortOrder,
                    IsPrimary = img.IsPrimary,
                    IsActive = img.IsActive,
                    UploadedByUserId = img.UploadedByUserId,
                    CreatedAt = img.CreatedAt,
                    UpdatedAt = img.UpdatedAt
                }).ToList()
            };
        }

        public async Task<List<CompanyDto>> GetCompaniesByEmployerIdAsync(Guid employerId)
        {
            var companies = await _unitOfWork.ProfileRepository.GetCompaniesByEmployerIdAsync(employerId);
            var result = new List<CompanyDto>();

            foreach (var c in companies)
            {
                var images = await _unitOfWork.ProfileRepository.GetCompanyImagesAsync(c.CompanyId);
                result.Add(new CompanyDto
                {
                    CompanyId = c.CompanyId,
                    Name = c.Name ?? string.Empty,
                    CompanyCode = c.CompanyCode,
                    Website = c.Website,
                    Description = c.Description,
                    Industry = c.Industry,
                    CompanySize = c.CompanySize,
                    FoundedYear = c.FoundedYear,
                    LogoURL = c.LogoURL,
                    Address = c.Address,
                    ContactEmail = c.ContactEmail,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Images = images.Select(img => new CompanyImageDto
                    {
                        CompanyImageId = img.CompanyImageId,
                        CompanyId = img.CompanyId,
                        ImageType = img.ImageType,
                        FilePath = img.FilePath,
                        FileName = img.FileName,
                        FileSize = img.FileSize,
                        FileType = img.FileType,
                        Caption = img.Caption,
                        SortOrder = img.SortOrder,
                        IsPrimary = img.IsPrimary,
                        IsActive = img.IsActive,
                        UploadedByUserId = img.UploadedByUserId,
                        CreatedAt = img.CreatedAt,
                        UpdatedAt = img.UpdatedAt
                    }).ToList()
                });
            }

            return result;
        }

        // Images
        public async Task<CandidateProfileImageDto> UploadCandidateProfileImageAsync(Guid candidateId, CandidateProfileImageCreateDto dto)
        {
            var image = new CandidateProfileImage
            {
                ImageId = Guid.NewGuid(),
                CandidateId = candidateId,
                FilePath = dto.FilePath,
                FileName = dto.FileName,
                FileSize = dto.FileSize,
                FileType = dto.FileType,
                Caption = dto.Caption,
                SortOrder = dto.SortOrder,
                IsPrimary = dto.IsPrimary,
                IsActive = dto.IsActive,
                UploadedByUserId = dto.UploadedByUserId,
                CreatedAt = DateTime.UtcNow
            };

            var createdImage = await _unitOfWork.ProfileRepository.CreateCandidateProfileImageAsync(image);
            await _unitOfWork.SaveChangesAsync();
            return new CandidateProfileImageDto
            {
                ImageId = createdImage.ImageId,
                CandidateId = createdImage.CandidateId,
                FilePath = createdImage.FilePath,
                FileName = createdImage.FileName,
                FileSize = createdImage.FileSize,
                FileType = createdImage.FileType,
                Caption = createdImage.Caption,
                SortOrder = createdImage.SortOrder,
                IsPrimary = createdImage.IsPrimary,
                IsActive = createdImage.IsActive,
                UploadedByUserId = createdImage.UploadedByUserId,
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
                FilePath = dto.FilePath,
                FileName = dto.FileName,
                FileSize = dto.FileSize,
                FileType = dto.FileType,
                Caption = dto.Caption,
                SortOrder = dto.SortOrder,
                IsPrimary = dto.IsPrimary,
                IsActive = dto.IsActive,
                UploadedByUserId = dto.UploadedByUserId,
                CreatedAt = DateTime.UtcNow
            };

            var createdImage = await _unitOfWork.ProfileRepository.CreateEmployerProfileImageAsync(image);
            await _unitOfWork.SaveChangesAsync();
            return new EmployerProfileImageDto
            {
                ImageId = createdImage.ImageId,
                EmployerId = createdImage.EmployerId,
                FilePath = createdImage.FilePath,
                FileName = createdImage.FileName,
                FileSize = createdImage.FileSize,
                FileType = createdImage.FileType,
                Caption = createdImage.Caption,
                SortOrder = createdImage.SortOrder,
                IsPrimary = createdImage.IsPrimary,
                IsActive = createdImage.IsActive,
                UploadedByUserId = createdImage.UploadedByUserId,
                CreatedAt = createdImage.CreatedAt,
                UpdatedAt = createdImage.UpdatedAt
            };
        }

        public async Task<CompanyImageDto> UploadCompanyImageAsync(Guid companyId, CompanyImageCreateDto dto)
        {
            var image = new CompanyImage
            {
                CompanyImageId = Guid.NewGuid(),
                CompanyId = companyId,
                FilePath = dto.FilePath,
                FileName = dto.FileName,
                FileSize = dto.FileSize,
                FileType = dto.FileType,
                Caption = dto.Caption,
                SortOrder = dto.SortOrder,
                IsPrimary = dto.IsPrimary,
                IsActive = dto.IsActive,
                UploadedByUserId = dto.UploadedByUserId,
                CreatedAt = DateTime.UtcNow
            };

            var createdImage = await _unitOfWork.ProfileRepository.CreateCompanyImageAsync(image);
            await _unitOfWork.SaveChangesAsync();
            return new CompanyImageDto
            {
                CompanyImageId = createdImage.CompanyImageId,
                CompanyId = createdImage.CompanyId,
                FilePath = createdImage.FilePath,
                FileName = createdImage.FileName,
                FileSize = createdImage.FileSize,
                FileType = createdImage.FileType,
                Caption = createdImage.Caption,
                SortOrder = createdImage.SortOrder,
                IsPrimary = createdImage.IsPrimary,
                IsActive = createdImage.IsActive,
                UploadedByUserId = createdImage.UploadedByUserId,
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
                FilePath = img.FilePath,
                FileName = img.FileName,
                FileSize = img.FileSize,
                FileType = img.FileType,
                Caption = img.Caption,
                SortOrder = img.SortOrder,
                IsPrimary = img.IsPrimary,
                IsActive = img.IsActive,
                UploadedByUserId = img.UploadedByUserId,
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
                FilePath = img.FilePath,
                FileName = img.FileName,
                FileSize = img.FileSize,
                FileType = img.FileType,
                Caption = img.Caption,
                SortOrder = img.SortOrder,
                IsPrimary = img.IsPrimary,
                IsActive = img.IsActive,
                UploadedByUserId = img.UploadedByUserId,
                CreatedAt = img.CreatedAt,
                UpdatedAt = img.UpdatedAt
            }).ToList();
        }

        public async Task<List<CompanyImageDto>> GetCompanyImagesAsync(Guid companyId)
        {
            var images = await _unitOfWork.ProfileRepository.GetCompanyImagesAsync(companyId);
            return images.Select(img => new CompanyImageDto
            {
                CompanyImageId = img.CompanyImageId,
                CompanyId = img.CompanyId,
                FilePath = img.FilePath,
                FileName = img.FileName,
                FileSize = img.FileSize,
                FileType = img.FileType,
                Caption = img.Caption,
                SortOrder = img.SortOrder,
                IsPrimary = img.IsPrimary,
                IsActive = img.IsActive,
                UploadedByUserId = img.UploadedByUserId,
                CreatedAt = img.CreatedAt,
                UpdatedAt = img.UpdatedAt
            }).ToList();
        }

        public async Task<CandidateProfileImageDto> UpdateCandidateProfileImageAsync(Guid imageId, CandidateProfileImageCreateDto dto)
        {
            var existingImage = await _unitOfWork.ProfileRepository.GetCandidateProfileImageByIdAsync(imageId);
            if (existingImage == null)
                throw new Exception("Candidate profile image not found");

            if (dto.FilePath != null) existingImage.FilePath = dto.FilePath;
            if (dto.FileName != null) existingImage.FileName = dto.FileName;
            if (dto.FileSize != 0) existingImage.FileSize = dto.FileSize;
            if (dto.FileType != null) existingImage.FileType = dto.FileType;
            if (dto.Caption != null) existingImage.Caption = dto.Caption;
            if (dto.SortOrder.HasValue) existingImage.SortOrder = dto.SortOrder.Value;
            if (dto.IsPrimary.HasValue) existingImage.IsPrimary = dto.IsPrimary.Value;
            if (dto.IsActive.HasValue) existingImage.IsActive = dto.IsActive.Value;
            existingImage.UpdatedAt = DateTime.UtcNow;

            var updatedImage = await _unitOfWork.ProfileRepository.UpdateCandidateProfileImageAsync(existingImage);
            await _unitOfWork.SaveChangesAsync();
            return new CandidateProfileImageDto
            {
                ImageId = updatedImage.ImageId,
                CandidateId = updatedImage.CandidateId,
                FilePath = updatedImage.FilePath,
                FileName = updatedImage.FileName,
                FileSize = updatedImage.FileSize,
                FileType = updatedImage.FileType,
                Caption = updatedImage.Caption,
                SortOrder = updatedImage.SortOrder,
                IsPrimary = updatedImage.IsPrimary,
                IsActive = updatedImage.IsActive,
                UploadedByUserId = updatedImage.UploadedByUserId,
                CreatedAt = updatedImage.CreatedAt,
                UpdatedAt = updatedImage.UpdatedAt
            };
        }

        public async Task<EmployerProfileImageDto> UpdateEmployerProfileImageAsync(Guid imageId, EmployerProfileImageCreateDto dto)
        {
            var existingImage = await _unitOfWork.ProfileRepository.GetEmployerProfileImageByIdAsync(imageId);
            if (existingImage == null)
                throw new Exception("Employer profile image not found");

            if (dto.FilePath != null) existingImage.FilePath = dto.FilePath;
            if (dto.FileName != null) existingImage.FileName = dto.FileName;
            if (dto.FileSize != 0) existingImage.FileSize = dto.FileSize;
            if (dto.FileType != null) existingImage.FileType = dto.FileType;
            if (dto.Caption != null) existingImage.Caption = dto.Caption;
            if (dto.SortOrder.HasValue) existingImage.SortOrder = dto.SortOrder.Value;
            if (dto.IsPrimary.HasValue) existingImage.IsPrimary = dto.IsPrimary.Value;
            if (dto.IsActive.HasValue) existingImage.IsActive = dto.IsActive.Value;
            existingImage.UpdatedAt = DateTime.UtcNow;

            var updatedImage = await _unitOfWork.ProfileRepository.UpdateEmployerProfileImageAsync(existingImage);
            await _unitOfWork.SaveChangesAsync();
            return new EmployerProfileImageDto
            {
                ImageId = updatedImage.ImageId,
                EmployerId = updatedImage.EmployerId,
                FilePath = updatedImage.FilePath,
                FileName = updatedImage.FileName,
                FileSize = updatedImage.FileSize,
                FileType = updatedImage.FileType,
                Caption = updatedImage.Caption,
                SortOrder = updatedImage.SortOrder,
                IsPrimary = updatedImage.IsPrimary,
                IsActive = updatedImage.IsActive,
                UploadedByUserId = updatedImage.UploadedByUserId,
                CreatedAt = updatedImage.CreatedAt,
                UpdatedAt = updatedImage.UpdatedAt
            };
        }

        public async Task<CompanyImageDto> UpdateCompanyImageAsync(Guid imageId, CompanyImageCreateDto dto)
        {
            var existingImage = await _unitOfWork.ProfileRepository.GetCompanyImageByIdAsync(imageId);
            if (existingImage == null)
                throw new Exception("Company image not found");

            if (dto.FilePath != null) existingImage.FilePath = dto.FilePath;
            if (dto.FileName != null) existingImage.FileName = dto.FileName;
            if (dto.FileSize != 0) existingImage.FileSize = dto.FileSize;
            if (dto.FileType != null) existingImage.FileType = dto.FileType;
            if (dto.Caption != null) existingImage.Caption = dto.Caption;
            if (dto.SortOrder.HasValue) existingImage.SortOrder = dto.SortOrder.Value;
            if (dto.IsPrimary.HasValue) existingImage.IsPrimary = dto.IsPrimary.Value;
            if (dto.IsActive.HasValue) existingImage.IsActive = dto.IsActive.Value;
            existingImage.UpdatedAt = DateTime.UtcNow;

            var updatedImage = await _unitOfWork.ProfileRepository.UpdateCompanyImageAsync(existingImage);
            await _unitOfWork.SaveChangesAsync();
            return new CompanyImageDto
            {
                CompanyImageId = updatedImage.CompanyImageId,
                CompanyId = updatedImage.CompanyId,
                FilePath = updatedImage.FilePath,
                FileName = updatedImage.FileName,
                FileSize = updatedImage.FileSize,
                FileType = updatedImage.FileType,
                Caption = updatedImage.Caption,
                SortOrder = updatedImage.SortOrder,
                IsPrimary = updatedImage.IsPrimary,
                IsActive = updatedImage.IsActive,
                UploadedByUserId = updatedImage.UploadedByUserId,
                CreatedAt = updatedImage.CreatedAt,
                UpdatedAt = updatedImage.UpdatedAt
            };
        }

        private async Task<ImageUploadResponse> UploadImageToServiceAsync(string companyId, IFormFile imageFile)
        {
            var imagesServiceUrl = _configuration["ImagesService:BaseUrl"];
            if (string.IsNullOrEmpty(imagesServiceUrl))
                throw new Exception("Images service URL not configured");

            using var content = new MultipartFormDataContent();
            using var stream = imageFile.OpenReadStream();
            content.Add(new StreamContent(stream), "file", imageFile.FileName);

            var response = await _httpClient.PostAsync($"{imagesServiceUrl}/upload/company/{companyId}", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadFromJsonAsync<ImageUploadResponse>();
            if (responseContent == null)
                throw new Exception("Invalid response from images service");

            return responseContent;
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
