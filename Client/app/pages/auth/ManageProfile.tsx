import React, { useState, useEffect } from "react";
import { FaUser, FaBuilding } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Notification from "../../components/Message/Notification";
import CreateCandidateProfile from "../../components/Form/CreateCandidateProfile";
import CreateEmployerProfile from "../../components/Form/CreateEmployerProfile";
import CandidateProfileView from "../../components/Form/CandidateProfileView";
import EmployerProfileView from "../../components/Form/EmployerProfileView";

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
            console.error("Error loading candidate profile:", candidateError);
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
            console.error("Error loading employer profile:", employerError);
          }
          // Leave employerProfile as null for 404 or other errors
        }
      } catch (error) {
        console.error("Unexpected error loading profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [user]);

  // Check if user is logged in
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600">
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
      const method = candidateProfile ? "put" : "post";
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
          console.error("Error uploading profile image:", imageError);
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
            console.error("Error uploading portfolio image:", imageError);
            setNotification({
              type: "warning",
              message:
                "Hồ sơ đã được lưu nhưng một số ảnh portfolio không thể tải lên.",
            });
          }
        }
      }

      // Reload profile to get any uploaded images
      try {
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate`,
          {
            withCredentials: true,
          }
        );
        setCandidateProfile(updatedResponse.data);
      } catch (error) {
        console.error("Error reloading profile:", error);
      }

      setNotification({
        type: "success",
        message: "Hồ sơ ứng cử viên đã được lưu thành công!",
      });
      setEditingCandidate(false);
    } catch (error: any) {
      console.error("Error saving candidate profile:", error);
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
            Name: company.name,
            LogoURL: company.logoURL,
            Website: company.website,
            Description: company.description,
            Industry: company.industry,
            CompanySize: company.companySize,
            FoundedYear: company.foundedYear,
            Address: company.address,
            ContactEmail: company.contactEmail,
            Role: company.role || "Owner",
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
          console.error("Error uploading profile image:", imageError);
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
              (c) => c.name === createdCompany.name
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
                  console.error("Error uploading company image:", imageError);
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
                console.error("Error uploading company image:", imageError);
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
        console.error("Error reloading employer profile:", error);
      }

      setNotification({
        type: "success",
        message: "Hồ sơ nhà tuyển dụng đã được lưu thành công!",
      });
      setActiveTab("employer");
      setEditingEmployer(false);
    } catch (error: any) {
      console.error("Error saving employer profile:", error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Đang tải...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý hồ sơ</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("candidate")}
          className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "candidate"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaUser />
          <span>Hồ sơ Ứng cử viên</span>
        </button>
        <button
          onClick={() => setActiveTab("employer")}
          className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "employer"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaBuilding />
          <span>Hồ sơ Nhà tuyển dụng</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "candidate" && (
        <>
          {editingCandidate || !candidateProfile ? (
            <CreateCandidateProfile
              profile={candidateProfile}
              onSubmit={handleCandidateSubmit}
              saving={saving}
              onCancel={() => setEditingCandidate(false)}
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
            />
          ) : (
            <EmployerProfileView
              profile={employerProfile}
              onEdit={() => setEditingEmployer(true)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ManageProfile;
