import MainLayout from "../layout/MainLayout";
import ManageJobList from "../components/Jobs/ManageJobList";
import postedJobs from "../data/postedJobs";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";
import { useState } from "react";
import ConfirmationModal from "../components/Common/ConfirmationModal";
import Modal from "../components/Common/Modal";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

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

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const handleEdit = (id: string) => {
    showInfo("Chỉnh sửa", `Chức năng chỉnh sửa tin đăng (ID: ${id}) đang được phát triển.`);
  };

  const handleDelete = (id: string) => {
    setModalState({
      isOpen: true,
      type: "delete",
      title: "Xóa tin đăng",
      message: "Bạn có chắc chắn muốn xóa tin đăng này?",
      action: () => {
        // API call would go here
        closeModal();
        setTimeout(() => showInfo("Thành công", `Đã xóa tin đăng với ID: ${id}`), 300);
      },
    });
  };

  const handleToggleStatus = (id: string) => {
    showInfo("Trạng thái", `Đã thay đổi trạng thái tin đăng với ID: ${id}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Quản lý tin đăng
        </h1>
        <ManageJobList
          jobs={postedJobs}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
        <Pagination
          totalItems={postedJobs.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

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
