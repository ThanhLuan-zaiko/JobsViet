import React from "react";
import { Link } from "react-router";
import { FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1D2B]">
      <div className="container mx-auto p-0 md:p-8 xl:px-0">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-4">
              <div>
                <Link to="/">
                  <div className="flex items-center space-x-2 text-2xl font-medium">
                    <span>
                      <img
                        src="/LogoJobsViet.png"
                        alt="JobsViet Logo"
                        width={64}
                        height={64}
                        className="w-16"
                      />
                    </span>
                    <span className="text-white">JobsViet</span>
                  </div>
                </Link>
              </div>
              <div className="max-w-md pr-16 text-md text-gray-200">
                Kết nối người tìm việc với các nhà tuyển dụng hàng đầu tại Việt
                Nam.
              </div>
              <div className="flex space-x-2">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-gray-200"
                >
                  <span className="sr-only">Linkedin</span>
                  <FaLinkedin className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-gray-200"
                >
                  <span className="sr-only">Twitter</span>
                  <FaTwitter className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-md font-semibold leading-6 text-white">
                    Dành cho bạn
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link
                        to="/home"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Trang chủ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/suggested"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Gợi ý tìm việc
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/trending"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Thịnh hành
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-md font-semibold leading-6 text-white">
                    Cho nhà tuyển dụng
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link
                        to="/post-job"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Đăng tin tuyển dụng
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/manage-jobs"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Quản lý đăng tin
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/applicants"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Ứng viên ứng tuyển
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-md font-semibold leading-6 text-white">
                    Thông tin
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link
                        to="/blog"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Bài đăng
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/terms"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Điều khoản dịch vụ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/privacy"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Chính sách bảo mật
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-md font-semibold leading-6 text-white">
                    Công ty
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link
                        to="/about"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Về chúng tôi
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/careers"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Chuyên môn
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="text-md leading-6 text-gray-300 hover:text-gray-50"
                      >
                        Liên hệ
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-400/30 pt-8 sm:mt-20 lg:mt-24">
            <div className="text-md text-center text-white">
              Copyright © 2025. Crafted with{" "}
              <span className="text-gray-50">♥</span> by the JobsViet team.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
