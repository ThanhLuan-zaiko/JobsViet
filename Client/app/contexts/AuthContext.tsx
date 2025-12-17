import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import type { UserDto, AuthResponse, NotificationType } from "../types/auth";

// Axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      return Promise.resolve({ data: null }); // Avoid throwing error
    }
    return Promise.reject(err);
  }
);

interface AuthContextType {
  user: UserDto | null;
  notification: NotificationType | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    role: string,
    name: string
  ) => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ) => Promise<void>;
  logout: () => void;
  setNotification: (notification: NotificationType | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [notification, setNotification] = useState<NotificationType | null>(
    null
  );

  useEffect(() => {
    // Check for existing session on app load
    // Always call /auth/me - the session cookie (.JobViet.Session) is HttpOnly
    // so JavaScript cannot read it, but it will be sent automatically with withCredentials: true
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );
        if (response.data) {
          setUser(response.data);
        }
      } catch (error: any) {
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      const { user: userData, message, messageType } = response.data;

      if (userData) {
        setUser(userData);
        setNotification({ message, type: messageType });
      } else {
        setUser(null);
        setNotification({ message, type: messageType });
      }
    } catch (error) {
      setUser(null);
    }
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    role: string,
    name: string
  ) => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        {
          email,
          password,
          confirmPassword,
          role: "User",
          name,
        },
        { withCredentials: true }
      );

      const { user: userData, message, messageType } = response.data;

      if (userData) {
        setUser(userData);
        setNotification({ message, type: messageType });
      } else {
        setUser(null); // Clear user state on register failure
        setNotification({ message, type: messageType });
      }
    } catch (error) {
      setUser(null); // Clear user state on error
    }
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/change-password`,
        {
          oldPassword,
          newPassword,
          confirmNewPassword,
        },
        { withCredentials: true }
      );

      // Set notification from server response
      if (response.data) {
        setNotification({
          message: response.data.message,
          type: response.data.messageType,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setUser(null);
        setNotification({
          message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
          type: "error",
        });
      } else if (error.response?.data?.message) {
        setNotification({
          message:
            error.response.data.message ||
            "Không có kết nối mạng vui lòng thử lại",
          type: error.response.data.messageType || "error",
        });
      }
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
      if (response.data) {
        setNotification({
          message: response.data.Message || "Đã đăng xuất thành công",
          type: response.data.MessageType || "success",
        });
      }
    } catch (error: any) {
      setUser(null);
      if (error.response?.data?.Message) {
        setNotification({
          message:
            error.response.data.Message ||
            "Không có kết nối mạng vui lòng thử lại",
          type: error.response.data.MessageType || "error",
        });
      }
    }
  };

  const value: AuthContextType = {
    user,
    notification,
    login,
    register,
    changePassword,
    logout,
    setNotification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
