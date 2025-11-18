import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useSignalR } from "./SignalRContext";
import type {
  ApplicationNotification,
  EmployerApplicationsSummary,
  JobApplicationCount,
} from "../types/applications";

interface ApplicationNotificationsContextType {
  jobCounts: JobApplicationCount[];
  notifications: ApplicationNotification[];
  totalUnread: number;
  refreshSummary: () => Promise<void>;
  markJobAsRead: (jobId: string) => Promise<void>;
  markNotificationAsRead: (jobId: string) => Promise<void>;
}

const ApplicationNotificationsContext = createContext<
  ApplicationNotificationsContextType | undefined
>(undefined);

interface ApplicationNotificationsProviderProps {
  children: ReactNode;
}

const emptySummary: EmployerApplicationsSummary = {
  totalUnread: 0,
  jobCounts: [],
  recentNotifications: [],
};

export const ApplicationNotificationsProvider: React.FC<
  ApplicationNotificationsProviderProps
> = ({ children }) => {
  const { user } = useAuth();
  const { subscribe } = useSignalR();
  const [summary, setSummary] =
    useState<EmployerApplicationsSummary>(emptySummary);

  const isEmployer = user?.role === "Employer";
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";

  const refreshSummary = useCallback(async () => {
    if (!isEmployer) {
      setSummary(emptySummary);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/applications/employer/summary`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = (await response.json()) as EmployerApplicationsSummary;
        setSummary(data);
      }
    } catch (error) {
      console.error("Failed to refresh applications summary:", error);
    }
  }, [baseUrl, isEmployer]);

  const markJobAsRead = useCallback(
    async (jobId: string) => {
      if (!isEmployer || !jobId) return;

      try {
        const response = await fetch(
          `${baseUrl}/applications/employer/jobs/${jobId}/mark-read`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data?.summary) {
            setSummary(data.summary as EmployerApplicationsSummary);
          } else {
            await refreshSummary();
          }
        }
      } catch (error) {
        console.error("Failed to mark applications as read:", error);
      }
    },
    [baseUrl, isEmployer, refreshSummary]
  );

  const markNotificationAsRead = useCallback(
    async (jobId: string) => {
      await markJobAsRead(jobId);
    },
    [markJobAsRead]
  );

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    if (!isEmployer) return;

    const unsubscribe = subscribe("receiveapplicationnotification", () => {
      refreshSummary();
    });

    return () => {
      unsubscribe();
    };
  }, [isEmployer, subscribe, refreshSummary]);

  const value = useMemo(
    () => ({
      jobCounts: summary.jobCounts,
      notifications: summary.recentNotifications,
      totalUnread: summary.totalUnread,
      refreshSummary,
      markJobAsRead,
      markNotificationAsRead,
    }),
    [summary, refreshSummary, markJobAsRead, markNotificationAsRead]
  );

  return (
    <ApplicationNotificationsContext.Provider value={value}>
      {children}
    </ApplicationNotificationsContext.Provider>
  );
};

export const useApplicationNotifications = () => {
  const context = useContext(ApplicationNotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useApplicationNotifications must be used within ApplicationNotificationsProvider"
    );
  }
  return context;
};

