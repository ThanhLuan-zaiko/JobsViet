import MainLayout from "../layout/MainLayout";
import PostJobForm from "../pages/auth/PostJobForm";

export function meta({}: any) {
  return [
    { title: "JobsViet - Đăng tin tuyển dụng" },
    {
      name: "description",
      content: "Đăng tin tuyển dụng mới trên JobsViet!",
    },
  ];
}

export default function PostJob() {
  return (
    <MainLayout>
      <PostJobForm />
    </MainLayout>
  );
}
