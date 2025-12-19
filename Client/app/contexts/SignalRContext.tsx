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

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  subscribe: (
    eventName: string,
    handler: (...args: any[]) => void
  ) => () => void;
  setJobCallback: (callback: ((jobDto: any) => void) | null) => void;
  joinUserGroup: (userId: string) => Promise<void>;
  leaveUserGroup: (userId: string) => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
  children: ReactNode;
}

const normalizeEventName = (eventName: string) =>
  eventName.trim().toLowerCase();

export const SignalRProvider: React.FC<SignalRProviderProps> = ({
  children,
}) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handlersRef = useRef<
    Map<string, Set<(...args: any[]) => void>>
  >(new Map());
  const dispatchersRef = useRef<Map<string, (...args: any[]) => void>>(
    new Map()
  );
  const connectionRef = useRef<HubConnection | null>(null);
  const jobSubscriptionRef = useRef<(() => void) | null>(null);

  const ensureDispatcher = useCallback(
    (normalizedEvent: string) => {
      if (dispatchersRef.current.has(normalizedEvent)) {
        return dispatchersRef.current.get(normalizedEvent);
      }

      const dispatcher = (...args: any[]) => {
        const handlers = handlersRef.current.get(normalizedEvent);
        if (!handlers) return;

        handlers.forEach((handler) => {
          try {
            handler(...args);
          } catch (error) {
          }
        });
      };

      dispatchersRef.current.set(normalizedEvent, dispatcher);
      if (connectionRef.current) {
        connectionRef.current.on(normalizedEvent, dispatcher);
      }

      return dispatcher;
    },
    []
  );

  const subscribe = useCallback(
    (eventName: string, handler: (...args: any[]) => void) => {
      const normalized = normalizeEventName(eventName);

      if (!handlersRef.current.has(normalized)) {
        handlersRef.current.set(normalized, new Set());
      }

      handlersRef.current.get(normalized)!.add(handler);
      ensureDispatcher(normalized);

      return () => {
        const handlers = handlersRef.current.get(normalized);
        if (!handlers) return;

        handlers.delete(handler);

        if (handlers.size === 0) {
          handlersRef.current.delete(normalized);

          const dispatcher = dispatchersRef.current.get(normalized);
          if (dispatcher && connectionRef.current) {
            connectionRef.current.off(normalized, dispatcher);
          }
          dispatchersRef.current.delete(normalized);
        }
      };
    },
    [ensureDispatcher]
  );

  const setJobCallback = useCallback(
    (callback: ((jobDto: any) => void) | null) => {
      if (jobSubscriptionRef.current) {
        jobSubscriptionRef.current();
        jobSubscriptionRef.current = null;
      }

      if (callback) {
        jobSubscriptionRef.current = subscribe("receivenewjob", callback);
      }
    },
    [subscribe]
  );

  const joinUserGroup = useCallback(
    async (userId: string) => {
      if (!connectionRef.current || !userId) return;
      try {
        await connectionRef.current.invoke("JoinUserGroup", userId);
      } catch (err) {
      }
    },
    []
  );

  const leaveUserGroup = useCallback(
    async (userId: string) => {
      if (!connectionRef.current || !userId) return;
      try {
        await connectionRef.current.invoke("LeaveUserGroup", userId);
      } catch (err) {
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const createConnection = async () => {
      const hubUrl = "/jobsHub";

      const newConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, { withCredentials: true })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      newConnection.onclose(() => {
        if (isMounted) setIsConnected(false);
      });

      newConnection.onreconnected(() => {
        if (isMounted) setIsConnected(true);
      });

      try {
        await newConnection.start();
        if (isMounted) {
          setIsConnected(true);
          setConnection(newConnection);
          connectionRef.current = newConnection;
        }
      } catch (err) {
        if (isMounted) setIsConnected(false);
      }
    };

    createConnection();

    return () => {
      isMounted = false;
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!connection) return;

    connectionRef.current = connection;
    dispatchersRef.current.forEach((dispatcher, eventName) => {
      connection.on(eventName, dispatcher);
    });

    return () => {
      dispatchersRef.current.forEach((dispatcher, eventName) => {
        connection.off(eventName, dispatcher);
      });
    };
  }, [connection]);

  return (
    <SignalRContext.Provider
      value={{
        connection,
        isConnected,
        subscribe,
        setJobCallback,
        joinUserGroup,
        leaveUserGroup,
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
