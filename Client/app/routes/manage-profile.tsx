import MainLayout from "../layout/MainLayout";
import ManageProfile from "../pages/auth/ManageProfile";

export function meta({}: any) {
  return [
    { title: "JobsViet - Quản lý hồ sơ" },
    {
      name: "description",
      content: "Quản lý hồ sơ cá nhân trên JobsViet!",
    },
  ];
}

export default function ManageProfileRoute() {
  return (
    <MainLayout>
      <ManageProfile />
    </MainLayout>
  );
}
