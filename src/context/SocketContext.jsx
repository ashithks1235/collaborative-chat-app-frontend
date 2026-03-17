import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuthContext();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  /* ===============================
     INITIALIZE SOCKET
  =============================== */
  useEffect(() => {
    if (!user?._id) {
      // Disconnect if user logs out
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
      {
        transports: ["websocket"],
        auth: {
          token:
            localStorage.getItem("token")
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      }
    );

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
    };

  }, [user?._id]);

  /* ===============================
     ROOM HELPERS
  =============================== */
  const joinProject = useCallback((projectId) => {
    socket?.emit("join:project", projectId);
  }, [socket]);

  const joinChannel = useCallback((channelId) => {
    socket?.emit("join:channel", channelId);
  }, [socket]);

  const leaveChannel = useCallback((channelId) => {
    socket?.emit("leave:channel", channelId);
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        joinProject,
        joinChannel,
        leaveChannel
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used inside SocketProvider");
  }
  return context;
};