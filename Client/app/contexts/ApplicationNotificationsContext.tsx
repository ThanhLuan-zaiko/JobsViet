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
import { api } from "../services/api";

interface ApplicationNotificationsContextType {
  jobCounts: JobApplicationCount[];
  notifications: ApplicationNotification[];
  totalUnread: number;
  refreshSummary: () => Promise<void>;
  markJobAsRead: (jobId: string) => Promise<void>;
  markNotificationAsRead: (jobId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const ApplicationNotificationsContext = createContext<
  ApplicationNotificationsContextType | undefined
>(undefined);
// ...


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

  // Handle potential PascalCase from API
  const role = user?.role || (user as any)?.Role;
  const userId = user?.userId || (user as any)?.UserId;
  const isEmployer = role === "Employer";

  const { subscribe, joinUserGroup, isConnected } = useSignalR();

  const [summary, setSummary] =
    useState<EmployerApplicationsSummary>(emptySummary);


  const refreshSummary = useCallback(async () => {
    if (!isEmployer) {
      setSummary(emptySummary);
      return;
    }

    try {
      const response = await api.get<EmployerApplicationsSummary>(
        "/v1.0/applications/employer/summary"
      );

      if (response.status === 200) {
        setSummary(response.data || emptySummary);
      }
    } catch (error) {
    }
  }, [isEmployer]);

  const markJobAsRead = useCallback(
    async (jobId: string) => {
      if (!isEmployer || !jobId) return;

      try {
        const response = await api.post(
          `/v1.0/applications/employer/jobs/${jobId}/mark-read`,
          {}
        );

        if (response.status === 200) {
          const data = response.data;
          if (data?.summary) {
            setSummary((data.summary || emptySummary) as EmployerApplicationsSummary);
          } else {
            await refreshSummary();
          }
        }
      } catch (error) {
      }
    },
    [isEmployer, refreshSummary]
  );

  const markNotificationAsRead = useCallback(
    async (jobId: string) => {
      await markJobAsRead(jobId);
    },
    [markJobAsRead]
  );

  const markAllAsRead = useCallback(async () => {
    if (!isEmployer) return;

    try {
      const response = await api.post(
        "/v1.0/applications/employer/mark-all-read",
        {}
      );

      if (response.status === 200) {
        const data = response.data;
        if (data?.summary) {
          setSummary((data.summary || emptySummary) as EmployerApplicationsSummary);
        } else {
          await refreshSummary();
        }
      }
    } catch (error) {
    }
  }, [isEmployer, refreshSummary]);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  // Join user-specific SignalR group when connected and authenticated
  useEffect(() => {
    if (!isEmployer || !isConnected || !userId) return;

    joinUserGroup(userId);
  }, [isEmployer, isConnected, userId, joinUserGroup]);

  useEffect(() => {
    if (!isEmployer) return;

    const unsubscribe = subscribe("receiveapplicationnotification", (notification: ApplicationNotification) => {
      setSummary((prev) => {
        // Ensure notification has ID (handle potential case sensitivity issues)
        const appId = notification.applicationId || (notification as any).ApplicationId;
        const jobID = notification.jobId || (notification as any).JobId;

        if (!appId || !jobID) {
          return prev;
        }

        // Avoid duplicates if any
        if (prev.recentNotifications.some(n => n.applicationId === appId)) {
          return prev;
        }

        // Update total unread
        const newTotalUnread = prev.totalUnread + 1;

        // Update job counts
        const existingJobCountIndex = prev.jobCounts.findIndex(j => j.jobId === jobID);
        let newJobCounts = [...prev.jobCounts];

        if (existingJobCountIndex >= 0) {
          newJobCounts[existingJobCountIndex] = {
            ...newJobCounts[existingJobCountIndex],
            applicationCount: newJobCounts[existingJobCountIndex].applicationCount + 1,
            unreadCount: newJobCounts[existingJobCountIndex].unreadCount + 1
          };
        } else {
          // If job count doesn't exist yet, add a basic entry
          newJobCounts.push({
            jobId: jobID,
            jobTitle: notification.jobTitle || (notification as any).JobTitle || "Unknown Job",
            applicationCount: 1,
            unreadCount: 1
          });
        }

        return {
          ...prev,
          totalUnread: newTotalUnread,
          jobCounts: newJobCounts,
          recentNotifications: [notification, ...prev.recentNotifications].slice(0, 10) // Keep recent 10
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isEmployer, subscribe]);

  const value = useMemo(
    () => ({
      jobCounts: summary?.jobCounts || [],
      notifications: summary?.recentNotifications || [],
      totalUnread: summary?.totalUnread || 0,
      refreshSummary,
      markJobAsRead,
      markNotificationAsRead,
      markAllAsRead,
    }),
    [summary, refreshSummary, markJobAsRead, markNotificationAsRead, markAllAsRead]
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

