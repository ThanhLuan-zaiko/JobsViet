import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import type { Job } from "../data/mockJobs";

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  setJobCallback: (callback: ((jobDto: any) => void) | null) => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
  children: ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({
  children,
}) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [jobCallback, setJobCallbackState] = useState<
    ((jobDto: any) => void) | null
  >(null);

  const setJobCallback = useCallback(
    (callback: ((jobDto: any) => void) | null) => {
      console.log("setJobCallback called with callback:", callback);
      setJobCallbackState(callback);
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const createConnection = async () => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";
      const hubUrl = `${baseUrl.replace("/api/v1.0", "")}/jobsHub`;
      console.log("Creating SignalR connection to:", hubUrl);

      const newConnection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Handle connection events
      newConnection.onclose(() => {
        console.log("SignalR connection closed");
        if (isMounted) setIsConnected(false);
      });

      newConnection.onreconnecting(() => {
        console.log("SignalR reconnecting...");
      });

      newConnection.onreconnected(() => {
        console.log("SignalR reconnected");
        if (isMounted) setIsConnected(true);
      });

      try {
        await newConnection.start();
        console.log("SignalR Connected!");
        if (isMounted) {
          setIsConnected(true);
          setConnection(newConnection);
        }
      } catch (err) {
        console.log("SignalR Connection failed: ", err);
        if (isMounted) setIsConnected(false);
      }
    };

    createConnection();

    return () => {
      console.log("Cleaning up SignalR connection");
      isMounted = false;
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  // Set up the job event handler when connection or callback changes
  useEffect(() => {
    if (connection && jobCallback) {
      console.log("Setting up job event handler");
      connection.on("receivenewjob", (jobDto: any) => {
        console.log("SignalR received new job in context:", jobDto);
        console.log("Calling job callback");
        try {
          jobCallback(jobDto);
          console.log("Job callback called successfully");
        } catch (error) {
          console.error("Error in job callback:", error);
        }
      });

      return () => {
        console.log("Removing job event handler");
        connection.off("receivenewjob");
      };
    }
  }, [connection, jobCallback]);

  return (
    <SignalRContext.Provider
      value={{
        connection,
        isConnected,
        setJobCallback,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};
