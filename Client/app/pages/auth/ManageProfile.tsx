import React, { useState, useEffect } from "react";
import { FaUser, FaBuilding } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import CreateCandidateProfile from "../../components/Form/CreateCandidateProfile";
import CreateEmployerProfile from "../../components/Form/CreateEmployerProfile";
import CandidateProfileView from "../../components/Form/CandidateProfileView";
import EmployerProfileView from "../../components/Form/EmployerProfileView";
import ConfirmationModal from "../../components/Common/ConfirmationModal";

const ManageProfile: React.FC = () => {
  const { user, setNotification, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"candidate" | "employer">(
    "candidate"
  );
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(false);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    type: "image" | "company" | null;
    imageType?: "candidate" | "employer" | "company";
    id: string | null;
    message: string;
  }>({
    isOpen: false,
    type: null,
    imageType: undefined,
    id: null,
    message: "",
  });


  // Load existing profiles on component mount
  useEffect(() => {
    const loadProfiles = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load candidate profile
        try {
          const candidateRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate`,
            {
              withCredentials: true,
            }
          );
          if (candidateRes.data) {
            setCandidateProfile(candidateRes.data);
          }
        } catch (candidateError: any) {
          // 404 means no profile exists, which is fine - user can create one
          if (candidateError.response?.status !== 404) {
          }
          // Leave candidateProfile as null for 404 or other errors
        }

        // Load employer profile
        try {
          const employerRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`,
            {
              withCredentials: true,
            }
          );
          if (employerRes.data) {
            setEmployerProfile(employerRes.data);
          }
        } catch (employerError: any) {
          // 404 means no profile exists, which is fine - user can create one
          if (employerError.response?.status !== 404) {
          }
          // Leave employerProfile as null for 404 or other errors
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Skeleton Header */}
          <div className="animate-pulse mb-8">
            <div className="h-10 bg-gray-200 rounded-lg w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          {/* Skeleton Tabs */}
          <div className="flex gap-2 mb-8">
            <div className="h-12 bg-gray-200 rounded-xl w-48"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-48"></div>
          </div>
          {/* Skeleton Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUser className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Bạn cần đăng nhập để sử dụng chức năng quản lý hồ sơ.
          </p>
        </div>
      </div>
    );
  }

  const handleCandidateSubmit = async (
    formData: any,
    profileImage: File | null,
    portfolioImages: File[]
  ) => {
    setSaving(true);
    try {
      // Save profile data first
      // Kiểm tra chính xác hơn: nếu có candidateId thì là update, không có thì là create
      const isUpdate = candidateProfile && candidateProfile.candidateId;
      const method = isUpdate ? "put" : "post";

      const response = await axios[method](
        `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate`,
        formData,
        { withCredentials: true }
      );

      setCandidateProfile(response.data);

      // Upload profile image if selected
      if (profileImage) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("file", profileImage);

          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_IMAGES_SERVICE}/upload/candidate/${response.data.candidateId}`,
            imageFormData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          // Send metadata to ASP.NET server
          const metadata = {
            ImageType: "profile",
            FilePath: uploadResponse.data.image_url,
            FileName: uploadResponse.data.file_name,
            FileSize: uploadResponse.data.file_size,
            FileType: uploadResponse.data.mime_type,
            IsPrimary: true,
          };

          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate/images`,
            metadata,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (imageError: any) {
          setNotification({
            type: "warning",
            message: "Hồ sơ đã được lưu nhưng không thể tải lên ảnh đại diện.",
          });
        }
      }

      // Upload portfolio images if selected
      if (portfolioImages.length > 0) {
        for (const image of portfolioImages) {
          try {
            const imageFormData = new FormData();
            imageFormData.append("file", image);

            const uploadResponse = await axios.post(
              `${import.meta.env.VITE_IMAGES_SERVICE}/upload/candidate/${response.data.candidateId}`,
              imageFormData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

            // Send metadata to ASP.NET server
            const metadata = {
              ImageType: "portfolio",
              FilePath: uploadResponse.data.image_url,
              FileName: uploadResponse.data.file_name,
              FileSize: uploadResponse.data.file_size,
              FileType: uploadResponse.data.mime_type,
            };

            await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate/images`,
              metadata,
              {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
              }
            );
          } catch (imageError: any) {
            setNotification({
              type: "warning",
              message:
                "Hồ sơ đã được lưu nhưng một số ảnh portfolio không thể tải lên.",
            });
          }
        }
      }

      // Reload profile to get any uploaded images and ensure data is fresh
      try {
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate`,
          {
            withCredentials: true,
          }
        );
        setCandidateProfile(updatedResponse.data);
      } catch (error) {
        if (response.data) {
          setCandidateProfile(response.data);
        }
      }

      setNotification({
        type: "success",
        message: isUpdate
          ? "Hồ sơ ứng cử viên đã được cập nhật thành công!"
          : "Hồ sơ ứng cử viên đã được tạo thành công!",
      });
      setEditingCandidate(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        setNotification({
          type: "warning",
          message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!",
        });
      } else {
        setNotification({
          type: "error",
          message:
            error.response?.data?.message || "Có lỗi xảy ra khi lưu hồ sơ",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEmployerSubmit = async (
    formData: any,
    companies: any[],
    profileImage: File | null,
    companyImages: { [key: string]: File[] }
  ) => {
    setSaving(true);
    try {
      const method = employerProfile ? "put" : "post";
      let employerResponse;

      if (method === "post") {
        // For creation, send employer data with companies
        const dataToSend = {
          ...formData,
          Companies: companies.map((company, index) => ({
            Name: company.Name,
            LogoURL: company.LogoURL,
            Website: company.Website,
            Description: company.Description,
            Industry: company.Industry,
            CompanySize: company.CompanySize,
            FoundedYear: company.FoundedYear,
            Address: company.Address,
            ContactEmail: company.ContactEmail,
            Role: company.Role || "Owner",
            IsPrimary: index === 0, // First company is primary
          })),
        };
        employerResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`,
          dataToSend,
          { withCredentials: true }
        );
      } else {
        // For update, send only employer data
        employerResponse = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`,
          formData,
          { withCredentials: true }
        );
      }

      // Upload profile image if selected
      if (profileImage) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("file", profileImage);

          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_IMAGES_SERVICE}/upload/employer/${employerResponse.data.employerId}`,
            imageFormData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          // Send metadata to ASP.NET server
          const metadata = {
            ImageType: "profile",
            FilePath: uploadResponse.data.image_url,
            FileName: uploadResponse.data.file_name,
            FileSize: uploadResponse.data.file_size,
            FileType: uploadResponse.data.mime_type,
          };

          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/employer/images`,
            metadata,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (imageError: any) {
          setNotification({
            type: "warning",
            message: "Hồ sơ đã được lưu nhưng không thể tải lên ảnh đại diện.",
          });
        }
      }

      if (method === "post") {
        // Companies are already created, upload images for each
        if (employerResponse.data.companies) {
          for (const createdCompany of employerResponse.data.companies) {
            const companyId = createdCompany.companyId;
            const originalCompany = companies.find(
              (c) => c.Name === createdCompany.name
            );
            if (
              originalCompany &&
              companyImages[originalCompany.id] &&
              companyImages[originalCompany.id].length > 0
            ) {
              for (const image of companyImages[originalCompany.id]) {
                try {
                  const imageFormData = new FormData();
                  imageFormData.append("file", image);

                  const uploadResponse = await axios.post(
                    `${import.meta.env.VITE_IMAGES_SERVICE}/upload/company/${companyId}`,
                    imageFormData,
                    {
                      headers: { "Content-Type": "multipart/form-data" },
                    }
                  );

                  // Send metadata to ASP.NET server
                  const metadata = {
                    ImageType: "company",
                    FilePath: uploadResponse.data.image_url,
                    FileName: uploadResponse.data.file_name,
                    FileSize: uploadResponse.data.file_size,
                    FileType: uploadResponse.data.mime_type,
                  };

                  await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/profiles/company/${companyId}/images`,
                    metadata,
                    {
                      withCredentials: true,
                      headers: { "Content-Type": "application/json" },
                    }
                  );
                } catch (imageError: any) {
                  setNotification({
                    type: "warning",
                    message:
                      "Công ty đã được lưu nhưng một số ảnh công ty không thể tải lên.",
                  });
                }
              }
            }
          }
        }
      } else {
        // For update, save companies separately
        for (const company of companies) {
          let companyResponse;
          if (company.id.startsWith("temp-")) {
            // New company - use the new endpoint that associates with employer
            companyResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/profiles/company/with-employer`,
              company,
              { withCredentials: true }
            );
          } else {
            // Update existing company
            companyResponse = await axios.put(
              `${import.meta.env.VITE_API_BASE_URL}/profiles/company/${company.id}`,
              company,
              { withCredentials: true }
            );
          }

          // Upload company images if selected
          const companyId = companyResponse.data.companyId || company.id;
          if (
            companyImages[company.id] &&
            companyImages[company.id].length > 0
          ) {
            for (const image of companyImages[company.id]) {
              try {
                const imageFormData = new FormData();
                imageFormData.append("file", image);

                const uploadResponse = await axios.post(
                  `${import.meta.env.VITE_IMAGES_SERVICE}/upload/company/${companyId}`,
                  imageFormData,
                  {
                    headers: { "Content-Type": "multipart/form-data" },
                  }
                );

                // Send metadata to ASP.NET server
                const metadata = {
                  ImageType: "company",
                  FilePath: uploadResponse.data.image_url,
                  FileName: uploadResponse.data.file_name,
                  FileSize: uploadResponse.data.file_size,
                  FileType: uploadResponse.data.mime_type,
                };

                await axios.post(
                  `${import.meta.env.VITE_API_BASE_URL}/profiles/company/${companyId}/images`,
                  metadata,
                  {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                  }
                );
              } catch (imageError: any) {
                setNotification({
                  type: "warning",
                  message:
                    "Công ty đã được lưu nhưng một số ảnh công ty không thể tải lên.",
                });
              }
            }
          }
        }
      }

      // Reload employer profile to get any uploaded images
      try {
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`,
          {
            withCredentials: true,
          }
        );
        setEmployerProfile(updatedResponse.data);
      } catch (error) {
      }

      setNotification({
        type: "success",
        message: "Hồ sơ nhà tuyển dụng đã được lưu thành công!",
      });
      setActiveTab("employer");
      setEditingEmployer(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        setNotification({
          type: "warning",
          message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!",
        });
      } else {
        setNotification({
          type: "error",
          message:
            error.response?.data?.message || "Có lỗi xảy ra khi lưu hồ sơ",
        });
      }
    } finally {
      setSaving(false);
    }
  };



  const confirmDeleteImage = (imageId: string, type: "candidate" | "employer" | "company" = "candidate") => {
    setConfirmationState({
      isOpen: true,
      type: "image",
      imageType: type,
      id: imageId,
      message: "Bạn có chắc chắn muốn xóa ảnh này không? Hành động này không thể hoàn tác.",
    });
  };

  const confirmDeleteCompany = (companyId: string) => {
    setConfirmationState({
      isOpen: true,
      type: "company",
      id: companyId,
      message: "Bạn có chắc chắn muốn xóa công ty này không? Hành động này không thể hoàn tác.",
    });
  };

  const handleExecuteDeleteCompany = async (companyId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/profiles/company/${companyId}`,
        { withCredentials: true }
      );

      // Refresh employer profile
      const updatedResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`,
        { withCredentials: true }
      );
      setEmployerProfile(updatedResponse.data);

      setNotification({
        type: "success",
        message: "Công ty đã được xóa thành công!",
      });
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Không thể xóa công ty.",
      });
    }
  };

  const handleExecuteDeleteImage = async (imageId: string, type: "candidate" | "employer" | "company") => {
    try {
      let endpoint = "";
      if (type === "candidate") {
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate/images/${imageId}`;
      } else if (type === "employer") {
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/profiles/employer/images/${imageId}`;
      } else if (type === "company") {
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/profiles/company/images/${imageId}`;
      }

      await axios.delete(endpoint, { withCredentials: true });

      // Refresh profile based on type
      if (type === "candidate") {
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate`,
          { withCredentials: true }
        );
        setCandidateProfile(updatedResponse.data);
      } else {
        // For employer or company images, refresh employer profile
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`,
          { withCredentials: true }
        );
        setEmployerProfile(updatedResponse.data);
      }

      setNotification({
        type: "success",
        message: "Ảnh đã được xóa thành công!",
      });
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Không thể xóa ảnh.",
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmationState.id) return;

    if (confirmationState.type === "image") {
      await handleExecuteDeleteImage(confirmationState.id, confirmationState.imageType || "candidate");
    } else if (confirmationState.type === "company") {
      await handleExecuteDeleteCompany(confirmationState.id);
    }
    setConfirmationState((prev) => ({ ...prev, isOpen: false }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Quản lý hồ sơ
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và hồ sơ nghề nghiệp của bạn
          </p>
        </div>

        {/* Modern Tabs */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg inline-flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("candidate")}
              className={`flex items-center justify-center sm:justify-start gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 w-full sm:w-auto ${activeTab === "candidate"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <FaUser className={activeTab === "candidate" ? "text-white" : "text-blue-500"} />
              <span>Hồ sơ Ứng cử viên</span>
              {candidateProfile && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "candidate"
                  ? "bg-white/20 text-white"
                  : "bg-green-100 text-green-600"
                  }`}>
                  ✓
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("employer")}
              className={`flex items-center justify-center sm:justify-start gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 w-full sm:w-auto ${activeTab === "employer"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <FaBuilding className={activeTab === "employer" ? "text-white" : "text-indigo-500"} />
              <span>Hồ sơ Nhà tuyển dụng</span>
              {employerProfile && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "employer"
                  ? "bg-white/20 text-white"
                  : "bg-green-100 text-green-600"
                  }`}>
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content with Animation */}
        <div className="animate-fadeIn">
          {activeTab === "candidate" && (
            <>
              {editingCandidate || !candidateProfile ? (
                <CreateCandidateProfile
                  profile={candidateProfile}
                  onSubmit={handleCandidateSubmit}
                  saving={saving}
                  onCancel={() => setEditingCandidate(false)}
                  onDeleteImage={(id) => confirmDeleteImage(id, "candidate")}
                />
              ) : (
                <CandidateProfileView
                  profile={candidateProfile}
                  onEdit={() => setEditingCandidate(true)}
                />
              )}
            </>
          )}
          {activeTab === "employer" && (
            <>
              {editingEmployer || !employerProfile ? (
                <CreateEmployerProfile
                  profile={employerProfile}
                  onSubmit={handleEmployerSubmit}
                  saving={saving}
                  onCancel={() => setEditingEmployer(false)}
                  onDeleteImage={(id) => confirmDeleteImage(id, "employer")}
                  onDeleteCompanyImage={(id) => confirmDeleteImage(id, "company")}
                />
              ) : (
                <EmployerProfileView
                  profile={employerProfile}
                  onEdit={() => setEditingEmployer(true)}
                  onDeleteCompany={confirmDeleteCompany}
                />
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={() =>
          setConfirmationState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleConfirmAction}
        title="Xác nhận xóa"
        message={confirmationState.message}
      />
    </div>
  );
};

export default ManageProfile;
