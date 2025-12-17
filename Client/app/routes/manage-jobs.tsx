import MainLayout from "../layout/MainLayout";
import ManageJobList from "../components/Jobs/ManageJobList";
import Pagination from "../components/Pagination";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import ConfirmationModal from "../components/Common/ConfirmationModal";
import Modal from "../components/Common/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useSignalR } from "../contexts/SignalRContext";
import axios from "axios";
import { FaUsers, FaArrowRight, FaSpinner, FaExclamationTriangle, FaBuilding } from "react-icons/fa";

// Login Required Component
const LoginRequired: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2" />
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-4xl mb-6">
          <FaUsers />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Bạn cần đăng nhập để quản lý tin tuyển dụng của mình.
        </p>
        <Link
          to="/?login=true"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Đăng nhập ngay
          <FaArrowRight />
        </Link>
      </div>
    </div>
  </div>
);

// Employer Profile Required Component
const EmployerProfileRequired: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-2" />
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 text-4xl mb-6">
          <FaExclamationTriangle />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Chưa có hồ sơ nhà tuyển dụng
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Bạn cần tạo hồ sơ nhà tuyển dụng để đăng và quản lý tin tuyển dụng.
        </p>
        <Link
          to="/manage-profile?tab=employer&create=true"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <FaBuilding />
          Tạo hồ sơ nhà tuyển dụng
          <FaArrowRight />
        </Link>
      </div>
    </div>
  </div>
);

export function meta({ }: any) {
  return [
    { title: "JobsViet - Quản lý tin đăng" },
    {
      name: "description",
      content: "Quản lý các tin tuyển dụng đã đăng trên JobsViet!",
    },
  ];
}

export default function ManageJobs() {
  const { user, setNotification } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEmployerProfile, setHasEmployerProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "delete" | "info";
    title: string;
    message: string;
    action?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const showInfo = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      type: "info",
      title,
      message,
    });
  };

  const { subscribe } = useSignalR();

  useEffect(() => {
    // Listen for JobUpdated
    const unsubscribeUpdated = subscribe("JobUpdated", (updatedJobDto: any) => {
      console.log("SignalR JobUpdated payload:", updatedJobDto);
      setJobs((prevJobs) => {
        const incomingId = updatedJobDto.jobId || updatedJobDto.JobId;
        const jobIndex = prevJobs.findIndex((j) => j.jobId === incomingId);

        const updatedJob = {
          id: updatedJobDto.jobId || updatedJobDto.JobId,
          guid: updatedJobDto.jobGuid || updatedJobDto.JobGuid,
          jobId: updatedJobDto.jobId || updatedJobDto.JobId,
          title: updatedJobDto.title || updatedJobDto.Title,
          company: updatedJobDto.companyName || updatedJobDto.CompanyName || updatedJobDto.company?.name || updatedJobDto.Company?.Name || "Công ty ẩn danh",
          location: updatedJobDto.companyLocation || updatedJobDto.CompanyLocation || updatedJobDto.company?.address || updatedJobDto.Company?.Address || "Không rõ",
          salary:
            ((updatedJobDto.salaryFrom ?? updatedJobDto.SalaryFrom) !== undefined && (updatedJobDto.salaryTo ?? updatedJobDto.SalaryTo) !== undefined)
              ? `${(updatedJobDto.salaryFrom ?? updatedJobDto.SalaryFrom).toLocaleString()} - ${(updatedJobDto.salaryTo ?? updatedJobDto.SalaryTo).toLocaleString()} VND`
              : "Thỏa thuận",
          description: updatedJobDto.description || updatedJobDto.Description || "",
          imageUrl:
            (updatedJobDto.images && updatedJobDto.images.length > 0)
              ? `${import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000"}${updatedJobDto.images[0].filePath || updatedJobDto.images[0].FilePath}`
              : (updatedJobDto.Images && updatedJobDto.Images.length > 0)
                ? `${import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000"}${updatedJobDto.Images[0].filePath || updatedJobDto.Images[0].FilePath}`
                : "https://via.placeholder.com/150",
          status: (updatedJobDto.hiringStatus === "OPEN" || updatedJobDto.HiringStatus === "OPEN") ? "active" : "inactive",
          postedByUserId: updatedJobDto.postedByUserId || updatedJobDto.PostedByUserId
        };

        console.log("SignalR Mapped Job:", updatedJob);

        let newJobs = [...prevJobs];

        if (jobIndex !== -1) {
          newJobs[jobIndex] = updatedJob;
        } else {
          // Optional: Handle new job appearance if current page is 1
          if (currentPage === 1) {
            newJobs = [updatedJob, ...newJobs];
            if (newJobs.length > itemsPerPage) newJobs.pop();
          }
        }
        return newJobs;
      });
    });

    // Listen for JobDeleted
    const unsubscribeDeleted = subscribe("JobDeleted", (jobId: string) => {
      // jobId could be GUID string, just compare directly
      setJobs((prevJobs) => prevJobs.filter((j) => j.jobId !== jobId && j.jobId !== jobId));
    });

    return () => {
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [subscribe, currentPage, itemsPerPage]); // Add dependencies

  useEffect(() => {
    const checkProfileAndFetchJobs = async () => {
      if (!user) {
        setCheckingProfile(false);
        setLoading(false);
        return;
      }

      try {
        try {
          await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`, // Assuming this exists or similar
            { withCredentials: true }
          );
          setHasEmployerProfile(true);
        }
        catch (e: any) {
          try {
            await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/profiles/employer/companies`,
              { withCredentials: true }
            );
            setHasEmployerProfile(true);
          } catch (error: any) {
            if (error.response?.status === 404) {
              setHasEmployerProfile(false);
              setCheckingProfile(false); // Stop here if no profile
              setLoading(false);
              return;
            }
          }
        }

        // Fetch valid jobs
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/jobs/my-jobs`,
          { withCredentials: true }
        );

        console.log("MyJobs API Response:", response.data);

        // Map API response to Job interface
        const mappedJobs = response.data.map((item: any) => {
          console.log("Mapping item:", item);

          const mappedItem = {
            id: item.jobId || item.JobId,
            guid: item.jobGuid || item.JobGuid,
            jobId: item.jobId || item.JobId,
            title: item.title || item.Title,
            company: item.companyName || item.CompanyName || item.company?.name || item.Company?.Name || "Công ty ẩn danh",
            location: item.companyLocation || item.CompanyLocation || item.company?.address || item.Company?.Address || "Không rõ",
            salary:
              ((item.salaryFrom ?? item.SalaryFrom) !== undefined && (item.salaryTo ?? item.SalaryTo) !== undefined)
                ? `${(item.salaryFrom ?? item.SalaryFrom).toLocaleString()} - ${(item.salaryTo ?? item.SalaryTo).toLocaleString()} VND`
                : "Thỏa thuận",
            description: item.description || item.Description || "",
            imageUrl:
              (item.images && item.images.length > 0)
                ? `${import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000"}${item.images[0].filePath || item.images[0].FilePath}`
                : (item.Images && item.Images.length > 0)
                  ? `${import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000"}${item.Images[0].filePath || item.Images[0].FilePath}`
                  : "https://via.placeholder.com/150",
            status: (item.hiringStatus === "OPEN" || item.HiringStatus === "OPEN") ? "active" : "inactive",
            postedByUserId: item.postedByUserId || item.PostedByUserId
          };

          console.log("Mapped item result:", mappedItem);
          return mappedItem;
        });

        setJobs(mappedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        // If my-jobs returns unauthorized/forbidden maybe handle?
      } finally {
        setCheckingProfile(false);
        setLoading(false);
      }
    };

    checkProfileAndFetchJobs();
  }, [user]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const handleEdit = (id: string) => {
    navigate(`/post-job?edit=true&id=${id}`);
  };

  const handleDelete = (id: string) => {
    setModalState({
      isOpen: true,
      type: "delete",
      title: "Xóa tin đăng",
      message: "Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.",
      action: async () => {
        try {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/jobs/${id}`,
            { withCredentials: true }
          );

          setJobs(prev => prev.filter(job => job.jobId !== id));
          setNotification({ message: "Đã xóa tin đăng thành công", type: "success" });
          closeModal();
        } catch (error) {
          setNotification({ message: "Xóa thất bại. Vui lòng thử lại.", type: "error" });
          closeModal();
        }
      },
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/jobs/${id}/status`,
        {},
        { withCredentials: true }
      );
      // No need to manually update state, SignalR will handle it
      setNotification({ message: "Đã cập nhật trạng thái tin", type: "success" });
    } catch (error) {
      setNotification({ message: "Cập nhật trạng thái thất bại", type: "error" });
    }
  };

  // Logic for display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);

  if (checkingProfile || (loading && hasEmployerProfile)) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <FaSpinner className="text-blue-600 text-2xl animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <LoginRequired />
      </MainLayout>
    );
  }

  if (!hasEmployerProfile) {
    return (
      <MainLayout>
        <EmployerProfileRequired />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Quản lý tin đăng
        </h1>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-4xl mb-4">
              <FaBuilding />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có tin tuyển dụng nào</h3>
            <p className="text-gray-500 mb-6">Bạn chưa đăng tin tuyển dụng nào. Hãy tạo tin mới ngay!</p>
            <Link to="/post-job" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Đăng tin mới
            </Link>
          </div>
        ) : (
          <>
            <ManageJobList
              jobs={currentJobs}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />

            {jobs.length > itemsPerPage && (
              <Pagination
                totalItems={jobs.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {modalState.type === "delete" ? (
          <ConfirmationModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onConfirm={modalState.action || closeModal}
            title={modalState.title}
            message={modalState.message}
          />
        ) : (
          <Modal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={modalState.title}
          >
            <p className="text-gray-600 mb-6">{modalState.message}</p>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}
