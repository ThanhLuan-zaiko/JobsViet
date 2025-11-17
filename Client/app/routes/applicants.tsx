import MainLayout from "../layout/MainLayout";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaSpinner, FaUser, FaEnvelope, FaPhone, FaCalendar } from "react-icons/fa";

interface Application {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  status: string;
  appliedAt: string;
  updatedAt?: string;
}

interface JobApplicationCount {
  jobId: string;
  jobTitle: string;
  applicationCount: number;
}

export default function Applicants() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobCounts, setJobCounts] = useState<JobApplicationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";

        // Fetch job counts
        const countsResponse = await fetch(
          `${baseUrl}/applications/employer/job-counts`,
          { credentials: "include" }
        );
        if (countsResponse.ok) {
          const counts = await countsResponse.json();
          setJobCounts(counts);
        }

        // Fetch all applications
        const appsResponse = await fetch(
          `${baseUrl}/applications/employer`,
          { credentials: "include" }
        );
        if (appsResponse.ok) {
          const apps = await appsResponse.json();
          setApplications(apps);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredApplications = selectedJobId
    ? applications.filter((app) => app.jobId === selectedJobId)
    : applications;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <FaSpinner className="animate-spin mx-auto text-4xl text-blue-600" />
            <p className="mt-4 text-gray-600">Đang tải danh sách ứng viên...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Ứng viên ứng tuyển
        </h1>

        {/* Job Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo công việc:
          </label>
          <select
            value={selectedJobId || ""}
            onChange={(e) => setSelectedJobId(e.target.value || null)}
            className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả công việc</option>
            {jobCounts.map((job) => (
              <option key={job.jobId} value={job.jobId}>
                {job.jobTitle} ({job.applicationCount} ứng viên)
              </option>
            ))}
          </select>
        </div>

        {/* Job Counts Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {jobCounts.map((job) => (
            <div
              key={job.jobId}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {job.jobTitle}
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {job.applicationCount}
              </p>
              <p className="text-sm text-gray-600">Ứng viên</p>
            </div>
          ))}
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách ứng viên ({filteredApplications.length})
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaUser className="mx-auto text-4xl mb-4 text-gray-400" />
              <p>Chưa có ứng viên nào ứng tuyển</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <div
                  key={app.applicationId}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.candidateName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {app.jobTitle}
                          </p>
                        </div>
                      </div>

                      <div className="ml-15 space-y-1">
                        {app.candidateEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaEnvelope className="text-gray-400" />
                            <a
                              href={`mailto:${app.candidateEmail}`}
                              className="hover:text-blue-600"
                            >
                              {app.candidateEmail}
                            </a>
                          </div>
                        )}
                        {app.candidatePhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaPhone className="text-gray-400" />
                            <a
                              href={`tel:${app.candidatePhone}`}
                              className="hover:text-blue-600"
                            >
                              {app.candidatePhone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendar className="text-gray-400" />
                          <span>
                            Ứng tuyển:{" "}
                            {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          app.status === "APPLIED"
                            ? "bg-blue-100 text-blue-800"
                            : app.status === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
