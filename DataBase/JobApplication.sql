------------------------------------------------------------
-- USERS
------------------------------------------------------------
CREATE TABLE Users (
  UserId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY, -- PK UUID
  UserName VARCHAR2(200) NOT NULL,
  Email VARCHAR2(200) NOT NULL UNIQUE,           -- Email duy nhất
  PasswordHash VARCHAR2(4000) NOT NULL,           -- Mật khẩu đã hash
  Role VARCHAR2(50) DEFAULT 'User' NOT NULL,     -- User, Admin, Moderator
  IsActive NUMBER(1) DEFAULT 1 NOT NULL,         -- 1=active, 0=inactive
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

------------------------------------------------------------
-- USERS: Add check constraint for Role
------------------------------------------------------------
ALTER TABLE Users
  ADD CONSTRAINT CkUsersRole
  CHECK (Role IN ('User', 'Moderator', 'Admin'));

------------------------------------------------------------
-- ROLES
------------------------------------------------------------
CREATE TABLE Roles (
  RoleId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  Name VARCHAR2(50) NOT NULL UNIQUE, -- 'User', 'Moderator', 'Admin'
  Description VARCHAR2(200)
);

------------------------------------------------------------
-- PERMISSIONS
-- PermissionKey là mã quyền dùng trong code/API (duy nhất)
------------------------------------------------------------
CREATE TABLE Permissions (
  PermissionId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  PermissionKey VARCHAR2(100) NOT NULL UNIQUE,  -- ví dụ: 'ApproveJobs'
  Description VARCHAR2(200)
);

------------------------------------------------------------
-- ROLE-PERMISSIONS (nhiều-nhiều)
------------------------------------------------------------
CREATE TABLE RolePermissions (
  RolePermissionId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  RoleId RAW(16) NOT NULL,
  PermissionId RAW(16) NOT NULL,
  CONSTRAINT FkRolePermissionsRole FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),
  CONSTRAINT FkRolePermissionsPermission FOREIGN KEY (PermissionId) REFERENCES Permissions(PermissionId),
  CONSTRAINT UqRolePermission UNIQUE (RoleId, PermissionId)
);

------------------------------------------------------------
-- USER-PERMISSIONS (override theo người dùng, tùy chọn)
-- Dùng để cấp thêm hoặc thu hồi quyền cụ thể ngoài Role
------------------------------------------------------------
CREATE TABLE UserPermissions (
  UserPermissionId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  UserId RAW(16) NOT NULL,
  PermissionId RAW(16) NOT NULL,
  IsGranted NUMBER(1) DEFAULT 1 NOT NULL, -- 1: cấp thêm, 0: thu hồi
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkUserPermissionsUser FOREIGN KEY (UserId) REFERENCES Users(UserId),
  CONSTRAINT FkUserPermissionsPermission FOREIGN KEY (PermissionId) REFERENCES Permissions(PermissionId),
  CONSTRAINT UqUserPermission UNIQUE (UserId, PermissionId)
);

------------------------------------------------------------
-- CANDIDATE PROFILES
------------------------------------------------------------
CREATE TABLE CandidateProfiles (
  CandidateId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  UserId RAW(16) NOT NULL UNIQUE,                -- Liên kết 1-1 với Users
  FullName VARCHAR2(200) NOT NULL,
  Phone VARCHAR2(50) NOT NULL,
  Headline VARCHAR2(300) NOT NULL,
  DateOfBirth DATE NOT NULL,                              -- Ngày sinh
  Gender VARCHAR2(20) NOT NULL,                           -- Giới tính (Male, Female, Other)
  Address VARCHAR2(500) NOT NULL,                         -- Địa chỉ
  EducationLevel VARCHAR2(100) NOT NULL,                  -- Trình độ học vấn (Bachelor, Master, etc.)
  ExperienceYears NUMBER NOT NULL,                        -- Số năm kinh nghiệm
  Skills VARCHAR2(2000) NOT NULL,                         -- Kỹ năng (danh sách cách nhau bởi dấu phẩy)
  LinkedInProfile VARCHAR2(300) NOT NULL,                 -- Liên kết LinkedIn
  PortfolioURL VARCHAR2(300) NOT NULL,                    -- Liên kết portfolio
  Bio CLOB NOT NULL,                                      -- Tiểu sử chi tiết
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkCandidateUser FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- CANDIDATE IMAGES
------------------------------------------------------------
CREATE TABLE CandidateImages (
  CandidateImageId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  CandidateId RAW(16) NOT NULL,                   -- FK tới CandidateProfiles
  FilePath VARCHAR2(500) NOT NULL,               -- Đường dẫn file/URL
  FileName VARCHAR2(255),                        -- Tên file gốc
  FileType VARCHAR2(100),                        -- MIME type (image/jpeg…)
  FileSize NUMBER,                               -- Dung lượng (bytes)
  Caption VARCHAR2(300),                         -- Mô tả ảnh
  SortOrder NUMBER DEFAULT 0,                    -- Thứ tự hiển thị
  IsPrimary NUMBER(1) DEFAULT 0,                 -- 1 = ảnh chính
  IsActive NUMBER(1) DEFAULT 1,                  -- 1 = hiển thị, 0 = ẩn
  UploadedByUserId RAW(16),                      -- Ai upload
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkCandidateImagesCandidate FOREIGN KEY (CandidateId) REFERENCES CandidateProfiles(CandidateId),
  CONSTRAINT FkCandidateImagesUser FOREIGN KEY (UploadedByUserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- EMPLOYER PROFILES
------------------------------------------------------------
CREATE TABLE EmployerProfiles (
  EmployerProfileId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  UserId RAW(16) NOT NULL UNIQUE,                -- Liên kết 1-1 với Users
  DisplayName VARCHAR2(200) NOT NULL,
  ContactPhone VARCHAR2(50) NOT NULL,
  Bio CLOB NOT NULL,                                      -- Tiểu sử nhà tuyển dụng
  Industry VARCHAR2(100) NOT NULL,                        -- Ngành nghề
  Position VARCHAR2(100) NOT NULL,                        -- Chức vụ
  YearsOfExperience NUMBER NOT NULL,                      -- Số năm kinh nghiệm
  LinkedInProfile VARCHAR2(300) NOT NULL,                 -- Liên kết LinkedIn
  Website VARCHAR2(300) NOT NULL,                         -- Website cá nhân
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkEmployerUser FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- EMPLOYER IMAGES
------------------------------------------------------------
CREATE TABLE EmployerImages (
  EmployerImageId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  EmployerProfileId RAW(16) NOT NULL,            -- FK tới EmployerProfiles
  FilePath VARCHAR2(500) NOT NULL,               -- Đường dẫn file/URL
  FileName VARCHAR2(255),                        -- Tên file gốc
  FileType VARCHAR2(100),                        -- MIME type (image/jpeg…)
  FileSize NUMBER,                               -- Dung lượng (bytes)
  Caption VARCHAR2(300),                         -- Mô tả ảnh
  SortOrder NUMBER DEFAULT 0,                    -- Thứ tự hiển thị
  IsPrimary NUMBER(1) DEFAULT 0,                 -- 1 = ảnh chính
  IsActive NUMBER(1) DEFAULT 1,                  -- 1 = hiển thị, 0 = ẩn
  UploadedByUserId RAW(16),                      -- Ai upload
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkEmployerImagesEmployer FOREIGN KEY (EmployerProfileId) REFERENCES EmployerProfiles(EmployerProfileId),
  CONSTRAINT FkEmployerImagesUser FOREIGN KEY (UploadedByUserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- COMPANIES
------------------------------------------------------------
CREATE TABLE Companies (
  CompanyId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  Name VARCHAR2(300) NOT NULL,
  CompanyCode VARCHAR2(100) DEFAULT SYS_GUID() UNIQUE,              -- Mã công ty duy nhất
  Website VARCHAR2(300) NOT NULL,
  Description CLOB NOT NULL,                              -- Mô tả công ty
  Industry VARCHAR2(100) NOT NULL,                        -- Ngành nghề
  CompanySize VARCHAR2(50) NOT NULL,                      -- Quy mô công ty (Small, Medium, Large)
  FoundedYear NUMBER NOT NULL,                            -- Năm thành lập
  LogoURL VARCHAR2(300) NOT NULL,                         -- URL logo công ty
  Address VARCHAR2(500) NOT NULL,                         -- Địa chỉ công ty
  ContactEmail VARCHAR2(200) NOT NULL,                    -- Email liên hệ
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP
);

------------------------------------------------------------
-- COMPANY IMAGES
------------------------------------------------------------
CREATE TABLE CompanyImages (
  CompanyImageId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  CompanyId RAW(16) NOT NULL,                     -- FK tới Companies
  FilePath VARCHAR2(500) NOT NULL,               -- Đường dẫn file/URL
  FileName VARCHAR2(255),                        -- Tên file gốc
  FileType VARCHAR2(100),                        -- MIME type (image/jpeg…)
  FileSize NUMBER,                               -- Dung lượng (bytes)
  Caption VARCHAR2(300),                         -- Mô tả ảnh
  SortOrder NUMBER DEFAULT 0,                    -- Thứ tự hiển thị
  IsPrimary NUMBER(1) DEFAULT 0,                 -- 1 = ảnh chính
  IsActive NUMBER(1) DEFAULT 1,                  -- 1 = hiển thị, 0 = ẩn
  UploadedByUserId RAW(16),                      -- Ai upload
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkCompanyImagesCompany FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
  CONSTRAINT FkCompanyImagesUser FOREIGN KEY (UploadedByUserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- EMPLOYER-COMPANY RELATION
------------------------------------------------------------
CREATE TABLE EmployerCompanies (
  Id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  EmployerProfileId RAW(16) NOT NULL,
  CompanyId RAW(16) NOT NULL,
  Role VARCHAR2(100) NOT NULL,                            -- Vai trò (HR, Admin…)
  IsPrimary NUMBER(1) DEFAULT 0,
  CONSTRAINT FkEcEmployer FOREIGN KEY (EmployerProfileId) REFERENCES EmployerProfiles(EmployerProfileId),
  CONSTRAINT FkEcCompany FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
  CONSTRAINT UqEcEmployerCompany UNIQUE (EmployerProfileId, CompanyId)
);

------------------------------------------------------------
-- JOB CATEGORIES
------------------------------------------------------------
CREATE TABLE JobCategories (
  CategoryId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  Name VARCHAR2(100) NOT NULL UNIQUE,             -- Tên category (IT, Marketing, etc.)
  Description VARCHAR2(4000) NOT NULL,                      -- Mô tả category
  IsActive NUMBER(1) DEFAULT 1 NOT NULL,          -- 1=active, 0=inactive
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

------------------------------------------------------------
-- JOBS
------------------------------------------------------------
CREATE TABLE Jobs (
  JobId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  JobGuid RAW(16) DEFAULT SYS_GUID() NOT NULL UNIQUE,
  PostedByUserId RAW(16) NOT NULL,               -- Ai đăng tin
  EmployerProfileId RAW(16) NOT NULL,
  CompanyId RAW(16) NOT NULL,
  Title VARCHAR2(4000) NOT NULL,
  Description CLOB NOT NULL,
  EmploymentType VARCHAR2(50) NOT NULL,
  SalaryFrom NUMBER NOT NULL,
  SalaryTo NUMBER NOT NULL,
  IsActive NUMBER(1) DEFAULT 1 NOT NULL,
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkJobsPoster FOREIGN KEY (PostedByUserId) REFERENCES Users(UserId),
  CONSTRAINT FkJobsEmployerProfile FOREIGN KEY (EmployerProfileId) REFERENCES EmployerProfiles(EmployerProfileId),
  CONSTRAINT FkJobsCompany FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

------------------------------------------------------------
-- JOBS: HIRING STATUS & CANDIDATE REQUIREMENTS
------------------------------------------------------------
ALTER TABLE Jobs ADD (
  HiringStatus VARCHAR2(20) DEFAULT 'OPEN' NOT NULL, -- OPEN, CLOSED, PAUSED, DRAFT, PENDING_APPROVAL, REJECTED
  PositionsNeeded NUMBER DEFAULT 1 NOT NULL,         -- Số lượng cần tuyển
  PositionsFilled NUMBER DEFAULT 0 NOT NULL,         -- Số lượng đã tuyển
  DeadlineDate DATE NOT NULL,                                 -- Hạn nộp hồ sơ
  MinAge NUMBER NOT NULL,                                     -- Tuổi tối thiểu
  MaxAge NUMBER NOT NULL,                                     -- Tuổi tối đa
  RequiredExperienceYears NUMBER NOT NULL,                    -- Kinh nghiệm tối thiểu
  RequiredDegree VARCHAR2(1000) NOT NULL,                      -- Bằng cấp yêu cầu
  GenderPreference VARCHAR2(20) NOT NULL,                     -- Nam/Nữ/Không yêu cầu
  SkillsRequired CLOB NOT NULL,                               -- Kỹ năng yêu cầu (text)
  CategoryId RAW(16) NOT NULL,                                -- FK tới JobCategories
  CONSTRAINT FkJobsCategory FOREIGN KEY (CategoryId) REFERENCES JobCategories(CategoryId)
);

------------------------------------------------------------
-- JOB IMAGES
------------------------------------------------------------
CREATE TABLE JobImages (
  JobImageId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  JobId RAW(16) NOT NULL,                        -- FK tới Jobs
  FilePath VARCHAR2(500) NOT NULL,               -- Đường dẫn file/URL
  FileName VARCHAR2(255),                        -- Tên file gốc
  FileType VARCHAR2(100),                        -- MIME type (image/jpeg…)
  FileSize NUMBER,                               -- Dung lượng (bytes)
  Caption VARCHAR2(300),                         -- Mô tả ảnh
  SortOrder NUMBER DEFAULT 0,                    -- Thứ tự hiển thị
  IsPrimary NUMBER(1) DEFAULT 0,                 -- 1 = ảnh chính
  IsActive NUMBER(1) DEFAULT 1,                  -- 1 = hiển thị, 0 = ẩn
  UploadedByUserId RAW(16),                      -- Ai upload
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkJobImagesJob FOREIGN KEY (JobId) REFERENCES Jobs(JobId),
  CONSTRAINT FkJobImagesUser FOREIGN KEY (UploadedByUserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- RESUMES
------------------------------------------------------------
CREATE TABLE Resumes (
  ResumeId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  CandidateId RAW(16) NOT NULL,
  Title VARCHAR2(250) NOT NULL,
  Content CLOB NOT NULL,
  IsPublic NUMBER(1) DEFAULT 0,
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkResumeCandidate FOREIGN KEY (CandidateId) REFERENCES CandidateProfiles(CandidateId)
);

------------------------------------------------------------
-- APPLICATIONS
------------------------------------------------------------
CREATE TABLE Applications (
  ApplicationId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  JobId RAW(16) NOT NULL,
  CandidateId RAW(16) NOT NULL,
  ResumeId RAW(16) NOT NULL,
  Status VARCHAR2(50) DEFAULT 'APPLIED' NOT NULL,
  AppliedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkAppJob FOREIGN KEY (JobId) REFERENCES Jobs(JobId),
  CONSTRAINT FkAppCandidate FOREIGN KEY (CandidateId) REFERENCES CandidateProfiles(CandidateId),
  CONSTRAINT FkAppResume FOREIGN KEY (ResumeId) REFERENCES Resumes(ResumeId),
  CONSTRAINT UqAppJobCandidate UNIQUE (JobId, CandidateId)
);

------------------------------------------------------------
-- REPORTS (COMPLAINTS / ABUSE)
------------------------------------------------------------
CREATE TABLE Reports (
  ReportId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  ReporterUserId RAW(16) NOT NULL,        -- Ai báo cáo
  TargetJobId RAW(16) NOT NULL,                    -- Tin tuyển dụng bị tố cáo
  TargetUserId RAW(16) NOT NULL,                   -- Hoặc người dùng bị tố cáo
  Reason VARCHAR2(500) NOT NULL,          -- Lý do tố cáo
  Status VARCHAR2(20) DEFAULT 'NEW',      -- NEW, IN_REVIEW, RESOLVED, REJECTED
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  ReviewedByAdminId RAW(16) NOT NULL,              -- Ai xử lý (Admin/Moderator)
  ReviewedAt TIMESTAMP,
  CONSTRAINT FkReportsReporter FOREIGN KEY (ReporterUserId) REFERENCES Users(UserId),
  CONSTRAINT FkReportsJob FOREIGN KEY (TargetJobId) REFERENCES Jobs(JobId),
  CONSTRAINT FkReportsTargetUser FOREIGN KEY (TargetUserId) REFERENCES Users(UserId),
  CONSTRAINT FkReportsAdmin FOREIGN KEY (ReviewedByAdminId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- REVIEWS: JOB REVIEWS
------------------------------------------------------------
CREATE TABLE JobReviews (
  JobReviewId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  JobId RAW(16) NOT NULL,                        -- Tin tuyển dụng được đánh giá
  ReviewerUserId RAW(16) NOT NULL,               -- Người đánh giá
  Rating NUMBER(1) NOT NULL CHECK (Rating BETWEEN 1 AND 5), -- Điểm 1-5
  Comments CLOB NOT NULL,                                 -- Nhận xét chi tiết
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkJobReviewsJob FOREIGN KEY (JobId) REFERENCES Jobs(JobId),
  CONSTRAINT FkJobReviewsUser FOREIGN KEY (ReviewerUserId) REFERENCES Users(UserId),
  CONSTRAINT UqJobReview UNIQUE (JobId, ReviewerUserId) -- 1 user chỉ review 1 job
);

------------------------------------------------------------
-- REVIEWS: COMPANY REVIEWS
------------------------------------------------------------
CREATE TABLE CompanyReviews (
  CompanyReviewId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  CompanyId RAW(16) NOT NULL,                    -- Công ty được đánh giá
  ReviewerUserId RAW(16) NOT NULL,
  Rating NUMBER(1) NOT NULL CHECK (Rating BETWEEN 1 AND 5),
  Pros CLOB NOT NULL,                                     -- Điểm mạnh
  Cons CLOB NOT NULL,                                     -- Điểm yếu
  Comments CLOB NOT NULL,
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkCompanyReviewsCompany FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
  CONSTRAINT FkCompanyReviewsUser FOREIGN KEY (ReviewerUserId) REFERENCES Users(UserId),
  CONSTRAINT UqCompanyReview UNIQUE (CompanyId, ReviewerUserId)
);

------------------------------------------------------------
-- (OPTIONAL) REVIEWS: EMPLOYER REVIEWS
------------------------------------------------------------
CREATE TABLE EmployerReviews (
  EmployerReviewId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  EmployerProfileId RAW(16) NOT NULL,            -- Nhà tuyển dụng được đánh giá
  ReviewerUserId RAW(16) NOT NULL,
  Rating NUMBER(1) NOT NULL CHECK (Rating BETWEEN 1 AND 5),
  Comments VARCHAR2(1000) NOT NULL,
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkEmployerReviewsEmployer FOREIGN KEY (EmployerProfileId) REFERENCES EmployerProfiles(EmployerProfileId),
  CONSTRAINT FkEmployerReviewsUser FOREIGN KEY (ReviewerUserId) REFERENCES Users(UserId),
  CONSTRAINT UqEmployerReview UNIQUE (EmployerProfileId, ReviewerUserId)
);

------------------------------------------------------------
-- NOTIFICATIONS
------------------------------------------------------------
CREATE TABLE Notifications (
  NotificationId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  UserId RAW(16) NOT NULL,                       -- Người nhận thông báo
  Type VARCHAR2(50) NOT NULL,                    -- Loại thông báo (JobUpdate, ApplicationStatus, etc.)
  Title VARCHAR2(200) NOT NULL,
  Message VARCHAR2(1000) NOT NULL,
  IsRead NUMBER(1) DEFAULT 0 NOT NULL,           -- 1 = đã đọc, 0 = chưa đọc
  RelatedJobId RAW(16) NOT NULL,                          -- Liên kết tới Job nếu có
  RelatedApplicationId RAW(16) NOT NULL,                  -- Liên kết tới Application nếu có
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkNotificationsUser FOREIGN KEY (UserId) REFERENCES Users(UserId),
  CONSTRAINT FkNotificationsJob FOREIGN KEY (RelatedJobId) REFERENCES Jobs(JobId),
  CONSTRAINT FkNotificationsApplication FOREIGN KEY (RelatedApplicationId) REFERENCES Applications(ApplicationId)
);

------------------------------------------------------------
-- MESSAGES
------------------------------------------------------------
CREATE TABLE Messages (
  MessageId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  SenderUserId RAW(16) NOT NULL,                 -- Người gửi
  ReceiverUserId RAW(16) NOT NULL,               -- Người nhận
  Subject VARCHAR2(200) NOT NULL,
  Content VARCHAR2(2000) NOT NULL,
  IsRead NUMBER(1) DEFAULT 0 NOT NULL,           -- 1 = đã đọc, 0 = chưa đọc
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT FkMessagesSender FOREIGN KEY (SenderUserId) REFERENCES Users(UserId),
  CONSTRAINT FkMessagesReceiver FOREIGN KEY (ReceiverUserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- BLOGS (Chia sẻ kinh nghiệm)
------------------------------------------------------------
CREATE TABLE Blogs (
  BlogId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  AuthorUserId RAW(16) NOT NULL,                 -- Tác giả (FK tới Users)
  Title VARCHAR2(300) NOT NULL,                  -- Tiêu đề blog
  Content CLOB NOT NULL,                         -- Nội dung blog
  IsPublished NUMBER(1) DEFAULT 1 NOT NULL,      -- 1 = công khai, 0 = nháp
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkBlogsAuthor FOREIGN KEY (AuthorUserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- BLOG IMAGES
------------------------------------------------------------
CREATE TABLE BlogImages (
  BlogImageId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  BlogId RAW(16) NOT NULL,                        -- FK tới Blogs
  FilePath VARCHAR2(500) NOT NULL,               -- Đường dẫn file/URL
  FileName VARCHAR2(255),                        -- Tên file gốc
  FileType VARCHAR2(100),                        -- MIME type (image/jpeg…)
  FileSize NUMBER,                               -- Dung lượng (bytes)
  Caption VARCHAR2(300),                         -- Mô tả ảnh
  SortOrder NUMBER DEFAULT 0,                    -- Thứ tự hiển thị
  IsPrimary NUMBER(1) DEFAULT 0,                 -- 1 = ảnh chính
  IsActive NUMBER(1) DEFAULT 1,                  -- 1 = hiển thị, 0 = ẩn
  UploadedByUserId RAW(16),                      -- Ai upload
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP,
  CONSTRAINT FkBlogImagesBlog FOREIGN KEY (BlogId) REFERENCES Blogs(BlogId),
  CONSTRAINT FkBlogImagesUser FOREIGN KEY (UploadedByUserId) REFERENCES Users(UserId)
);

------------------------------------------------------------
-- INDEXES (TỐI ƯU TRUY VẤN)
------------------------------------------------------------
-- Jobs: lọc theo trạng thái, công ty, hạn nộp, còn hiệu lực
CREATE INDEX IxJobsHiringStatus ON Jobs (HiringStatus);
CREATE INDEX IxJobsCompanyId ON Jobs (CompanyId);
CREATE INDEX IxJobsDeadlineDate ON Jobs (DeadlineDate);
CREATE INDEX IxJobsIsActive ON Jobs (IsActive);

-- Applications: tra cứu nhanh theo JobId, CandidateId
CREATE INDEX IxAppJobId ON Applications (JobId);
CREATE INDEX IxAppCandidateId ON Applications (CandidateId);

-- Reports: theo trạng thái và thời gian
CREATE INDEX IxReportsStatus ON Reports (Status);
CREATE INDEX IxReportsCreatedAt ON Reports (CreatedAt);

-- Reviews: theo đối tượng và người đánh giá
CREATE INDEX IxJobReviewsJobId ON JobReviews (JobId);
CREATE INDEX IxCompanyReviewsCompanyId ON CompanyReviews (CompanyId);
CREATE INDEX IxEmployerReviewsEmployerProfileId ON EmployerReviews (EmployerProfileId);

-- Add indexes on foreign key columns to improve JOIN/update performance
CREATE INDEX IxJobsPostedByUserId ON Jobs (PostedByUserId);
CREATE INDEX IxJobsEmployerProfileId ON Jobs (EmployerProfileId);
CREATE INDEX IxJobsCategoryId ON Jobs (CategoryId);
CREATE INDEX IxJobImagesUploadedByUserId ON JobImages (UploadedByUserId);
CREATE INDEX IxApplicationsResumeId ON Applications (ResumeId);
CREATE INDEX IxReportsTargetJobId ON Reports (TargetJobId);
CREATE INDEX IxReportsReporterUserId ON Reports (ReporterUserId);

-- Indexes for new tables
CREATE INDEX IxBlogsAuthorUserId ON Blogs (AuthorUserId);
CREATE INDEX IxBlogsIsPublished ON Blogs (IsPublished);
CREATE INDEX IxBlogImagesBlogId ON BlogImages (BlogId);
CREATE INDEX IxBlogImagesUploadedByUserId ON BlogImages (UploadedByUserId);

-- Indexes for image tables
CREATE INDEX IxCandidateImagesCandidateId ON CandidateImages (CandidateId);
CREATE INDEX IxCandidateImagesUploadedByUserId ON CandidateImages (UploadedByUserId);
CREATE INDEX IxEmployerImagesEmployerProfileId ON EmployerImages (EmployerProfileId);
CREATE INDEX IxEmployerImagesUploadedByUserId ON EmployerImages (UploadedByUserId);

------------------------------------------------------------
-- DEPLOYMENT: TRIGGERS AND SCHEDULER JOB
-- NOTE:
-- 1) Run after base schema creation (Users, Jobs, Applications, Reports).
-- 2) Triggers are 'CREATE OR REPLACE' for idempotent deployments.
------------------------------------------------------------

------------------------------------------------------------
-- 1) TRIGGER: TrgJobsDefaultPendingApproval
-- - On INSERT Jobs:
--   If poster is not Admin/Moderator => set PENDING_APPROVAL and IsActive=0.
--   Otherwise default to OPEN if not set, IsActive=1 unless provided.
------------------------------------------------------------
-- TrgJobsDefaultPendingApproval removed: replaced by TrgJobsModeration (centralized moderation logic)
-- Reason: avoid duplicate BEFORE INSERT triggers on Jobs and centralize moderation & audit logic.
------------------------------------------------------------

------------------------------------------------------------
-- 2) TRIGGER: TrgJobsAutoCloseOnFilled
-- - On UPDATE Jobs.PositionsFilled or PositionsNeeded:
--   If filled >= needed => set CLOSED and IsActive=0.
------------------------------------------------------------
-- Removed an unsafe row-level auto-close trigger: replaced by a statement-level implementation later in the file
-- Reason: avoid updating the same table in a row-level trigger which can cause mutating table errors.
------------------------------------------------------------

------------------------------------------------------------
-- 3) TRIGGER: TrgApplicationsStatusUpdateCount
-- - On INSERT/UPDATE Applications.Status:
--   + To HIRED from non-HIRED => increment Jobs.PositionsFilled.
--   + From HIRED to non-HIRED => decrement (not below 0).
------------------------------------------------------------
-- Removed row-level Applications -> Jobs counter trigger
-- Reason: replaced by the compound trigger CtApplicationsHireCount which safely aggregates deltas and avoids mutating table errors.
------------------------------------------------------------

------------------------------------------------------------
-- 4) TRIGGER: TrgReportsAutoFlagJob
-- - On INSERT Reports:
--   If NEW reports on same Job reach threshold (default 3)
--   => Pause the job (IsActive=0, HiringStatus='PAUSED') unless already CLOSED/REJECTED.
------------------------------------------------------------
-- Removed earlier Reports auto-flag trigger (duplicate). Kept a single audited implementation later in the file.
------------------------------------------------------------

------------------------------------------------------------
-- 5) SCHEDULER JOB: CloseExpiredJobs
-- - Runs every 15 minutes.
-- - Closes (CLOSED, IsActive=0) jobs past their DeadlineDate.
-- REQUIREMENTS:
--   * EXECUTE privilege on DBMS_SCHEDULER for deploying schema owner.
------------------------------------------------------------
-- Removed duplicate scheduler creation here (kept one later in the file). Scheduler creation requires DBMS_SCHEDULER privileges.
-- Verify job state (optional)
-- SELECT job_name, state FROM dba_scheduler_jobs WHERE job_name = 'CLOSEEXPIREDJOBS';
------------------------------------------------------------

------------------------------------------------------------
-- PACKAGE: AppSecurity (constants + permission check)
------------------------------------------------------------
CREATE OR REPLACE PACKAGE AppSecurity AS
  -- Permission keys
  cPermApproveJobs CONSTANT VARCHAR2(100) := 'ApproveJobs';
  cPermRejectJobs  CONSTANT VARCHAR2(100) := 'RejectJobs';
  cPermPauseJobs   CONSTANT VARCHAR2(100) := 'PauseJobs';
  cPermResolveReports CONSTANT VARCHAR2(100) := 'ResolveReports';
  cPermViewReports CONSTANT VARCHAR2(100) := 'ViewReports';

  FUNCTION HasPermission(pUserId IN RAW, pPermKey IN VARCHAR2) RETURN NUMBER;
END AppSecurity;
/

CREATE OR REPLACE PACKAGE BODY AppSecurity AS
  FUNCTION HasPermission(pUserId IN RAW, pPermKey IN VARCHAR2) RETURN NUMBER IS
    vCount NUMBER := 0;
  BEGIN
    -- Granted by role
    SELECT COUNT(*)
      INTO vCount
      FROM Users u
      JOIN Roles r ON r.Name = u.Role
      JOIN RolePermissions rp ON rp.RoleId = r.RoleId
      JOIN Permissions p ON p.PermissionId = rp.PermissionId
     WHERE u.UserId = pUserId
       AND p.PermissionKey = pPermKey;

    -- Override by user: grant
    IF vCount = 0 THEN
      SELECT COUNT(*)
        INTO vCount
        FROM UserPermissions up
        JOIN Permissions p ON p.PermissionId = up.PermissionId
       WHERE up.UserId = pUserId
         AND up.IsGranted = 1
         AND p.PermissionKey = pPermKey;
    END IF;

    RETURN CASE WHEN vCount > 0 THEN 1 ELSE 0 END;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 0;
  END HasPermission;
END AppSecurity;
/

------------------------------------------------------------
-- AUDIT LOG TABLE + PROCEDURE (autonomous transaction)
------------------------------------------------------------
CREATE TABLE AuditLogs (
  AuditId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  WhoUserId RAW(16),
  Action VARCHAR2(100) NOT NULL,
  TargetType VARCHAR2(50),
  TargetId RAW(16),
  Details VARCHAR2(1000),
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- Table to store audit logging failures so they are not silently swallowed
CREATE TABLE AuditErrors (
  AuditErrorId RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  FailedProc VARCHAR2(100),
  ErrorMsg VARCHAR2(2000),
  Payload VARCHAR2(2000),
  CreatedAt TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- Indexes for audit tables
CREATE INDEX IxAuditLogsCreatedAt ON AuditLogs (CreatedAt);
CREATE INDEX IxAuditErrorsCreatedAt ON AuditErrors (CreatedAt);

CREATE OR REPLACE PROCEDURE LogAudit(
  pWhoUserId IN RAW,
  pAction IN VARCHAR2,
  pTargetType IN VARCHAR2,
  pTargetId IN RAW,
  pDetails IN VARCHAR2
) IS
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  INSERT INTO AuditLogs (WhoUserId, Action, TargetType, TargetId, Details)
  VALUES (pWhoUserId, pAction, pTargetType, pTargetId, pDetails);
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    DECLARE
      v_errmsg VARCHAR2(2000) := SQLERRM;
    BEGIN
      -- If audit insert fails, persist the error for later inspection instead of swallowing
      -- Use INSERT ... SELECT FROM DUAL to ensure the expression context is evaluated correctly
      INSERT INTO AuditErrors (FailedProc, ErrorMsg, Payload)
      SELECT 'LogAudit', v_errmsg,
             SUBSTR(NVL(pDetails,'') || ' | user=' || NVL(RAWTOHEX(pWhoUserId), ''), 1, 2000)
      FROM DUAL;
      COMMIT;
    EXCEPTION
      WHEN OTHERS THEN
        NULL; -- last resort: avoid raising from logging failures
    END;
END LogAudit;
/

------------------------------------------------------------
-- PROCEDURE: PauseJobByUser
-- Only Moderator/Admin can pause a job.
-- If no permission => raise exception.
-- Audit log if successful.
------------------------------------------------------------
CREATE OR REPLACE PROCEDURE PauseJobByUser(pJobId IN RAW, pUserId IN RAW) IS
  vHasPermission NUMBER;
  vCurrentStatus VARCHAR2(20);
BEGIN
  -- Kiểm tra quyền
  vHasPermission := AppSecurity.HasPermission(pUserId, AppSecurity.cPermPauseJobs);

  IF vHasPermission = 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'Bạn không có quyền tạm dừng tin tuyển dụng này.');
  END IF;

  -- Kiểm tra trạng thái hiện tại
  SELECT HiringStatus INTO vCurrentStatus
    FROM Jobs
   WHERE JobId = pJobId;

  IF vCurrentStatus IN ('CLOSED', 'REJECTED') THEN
    RAISE_APPLICATION_ERROR(-20002, 'Tin đã đóng hoặc bị từ chối, không thể tạm dừng.');
  END IF;

  -- Cập nhật trạng thái
  UPDATE Jobs
     SET HiringStatus = 'PAUSED',
         IsActive = 0
   WHERE JobId = pJobId;

  -- Ghi log audit
  LogAudit(pUserId, 'PauseJobManual', 'Job', pJobId, 'Tạm dừng thủ công bởi người dùng có quyền.');
END PauseJobByUser;
/

INSERT INTO Roles (Name, Description)
VALUES ('User', 'Người dùng thông thường');

INSERT INTO Roles (Name, Description)
VALUES ('Moderator', 'Người kiểm duyệt nội dung');

INSERT INTO Roles (Name, Description)
VALUES ('Admin', 'Quản trị hệ thống');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('EditProfile', 'Chỉnh sửa hồ sơ cá nhân');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('UploadResume', 'Tải lên CV');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ApplyJob', 'Ứng tuyển công việc');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('WithdrawApplication', 'Rút hồ sơ ứng tuyển');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ViewApplicationStatus', 'Xem trạng thái ứng tuyển');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('CreateJobPost', 'Tạo tin tuyển dụng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('EditJobPost', 'Chỉnh sửa tin tuyển dụng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('DeleteJobPost', 'Xóa tin tuyển dụng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ViewApplicants', 'Xem danh sách ứng viên');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ApproveCandidate', 'Duyệt ứng viên');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('RejectCandidate', 'Từ chối ứng viên');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ScheduleInterview', 'Lên lịch phỏng vấn');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('SendOffer', 'Gửi thư mời nhận việc');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('RejectOffer', 'Từ chối ứng viên sau phỏng vấn');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('CreatePost', 'Tạo bài viết diễn đàn');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('EditPost', 'Chỉnh sửa bài viết');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('DeletePost', 'Xóa bài viết');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ReportContent', 'Báo cáo nội dung vi phạm');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ApproveJobPost', 'Duyệt tin tuyển dụng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('RejectJobPost', 'Từ chối tin tuyển dụng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ManageUsers', 'Quản lý người dùng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('AssignRoles', 'Gán vai trò cho người dùng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('ViewReports', 'Xem báo cáo thống kê');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('BanUser', 'Khóa tài khoản người dùng');

INSERT INTO Permissions (PermissionKey, Description)
VALUES ('UnbanUser', 'Mở khóa tài khoản người dùng');

INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.RoleId, p.PermissionId
FROM Roles r, Permissions p
WHERE r.Name = 'User'
  AND p.PermissionKey IN (
    'EditProfile','UploadResume','ApplyJob','WithdrawApplication','ViewApplicationStatus',
    'CreateJobPost','EditJobPost','DeleteJobPost','ViewApplicants',
    'ApproveCandidate','RejectCandidate','ScheduleInterview','SendOffer','RejectOffer',
    'CreatePost','EditPost','DeletePost','ReportContent'
  );

INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.RoleId, p.PermissionId
FROM Roles r, Permissions p
WHERE r.Name = 'Moderator'
  AND p.PermissionKey IN (
    'ApproveJobPost','RejectJobPost','DeletePost','ReportContent'
  );

INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.RoleId, p.PermissionId
FROM Roles r, Permissions p
WHERE r.Name = 'Admin';

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Information Technology', 'Ngành CNTT: lập trình, hệ thống, bảo mật, AI, dữ liệu', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Marketing', 'Ngành tiếp thị: quảng cáo, nội dung, SEO, truyền thông', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Sales', 'Ngành bán hàng: tư vấn, chăm sóc khách hàng, phát triển thị trường', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Finance and Accounting', 'Ngành tài chính: kế toán, kiểm toán, phân tích đầu tư', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Human Resources', 'Ngành nhân sự: tuyển dụng, đào tạo, quản lý nhân sự', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Design and Creative', 'Ngành thiết kế: đồ họa, UI/UX, sáng tạo nội dung', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Education and Training', 'Ngành giáo dục: giảng dạy, đào tạo, phát triển kỹ năng', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Healthcare', 'Ngành y tế: bác sĩ, điều dưỡng, dược sĩ, chăm sóc sức khỏe', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Construction and Engineering', 'Ngành xây dựng: kỹ sư, kiến trúc, giám sát công trình', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Logistics and Supply Chain', 'Ngành hậu cần: vận chuyển, kho bãi, chuỗi cung ứng', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Legal and Compliance', 'Ngành pháp lý: luật sư, tư vấn pháp luật, kiểm soát nội bộ', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Customer Service', 'Ngành dịch vụ khách hàng: tổng đài, hỗ trợ kỹ thuật, chăm sóc khách hàng', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Hospitality and Tourism', 'Ngành du lịch: khách sạn, nhà hàng, hướng dẫn viên, tổ chức sự kiện', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Manufacturing', 'Ngành sản xuất: vận hành máy móc, quản lý dây chuyền, kiểm tra chất lượng', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Agriculture and Environment', 'Ngành nông nghiệp: trồng trọt, chăn nuôi, môi trường, sinh thái', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Media and Entertainment', 'Ngành truyền thông: báo chí, truyền hình, sản xuất nội dung số', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Real Estate', 'Ngành bất động sản: môi giới, quản lý tài sản, đầu tư nhà đất', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Data Science and AI', 'Ngành dữ liệu: phân tích, học máy, trí tuệ nhân tạo', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Blockchain and Web3', 'Ngành công nghệ chuỗi khối: phát triển hợp đồng thông minh, NFT, crypto', 1);

INSERT INTO JobCategories (Name, Description, IsActive)
VALUES ('Game Development', 'Ngành phát triển game: thiết kế, lập trình, đồ họa, âm thanh', 1);

------------------------------------------------------------
-- MIGRATION: Add IsViewedByEmployer and EmployerViewedAt columns to APPLICATIONS table
-- Date: 2025-11-18
-- Description: Add tracking for when employer views applications
------------------------------------------------------------

-- Add ISVIEWEDBYEMPLOYER column (NUMBER(1) for boolean: 0 = false, 1 = true)
ALTER TABLE APPLICATIONS
  ADD ISVIEWEDBYEMPLOYER NUMBER(1) DEFAULT 0 NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN APPLICATIONS.ISVIEWEDBYEMPLOYER IS 'Flag indicating if employer has viewed this application (0 = false, 1 = true)';

-- Add EMPLOYERVIEWEDAT column (nullable TIMESTAMP)
ALTER TABLE APPLICATIONS
  ADD EMPLOYERVIEWEDAT TIMESTAMP;

-- Add comment to explain the column
COMMENT ON COLUMN APPLICATIONS.EMPLOYERVIEWEDAT IS 'Timestamp when employer first viewed this application';

-- Update existing records: if they were created before this migration, they are considered not viewed
-- (This is already handled by DEFAULT 0, but we can be explicit)
UPDATE APPLICATIONS
SET ISVIEWEDBYEMPLOYER = 0
WHERE ISVIEWEDBYEMPLOYER IS NULL;

COMMIT;