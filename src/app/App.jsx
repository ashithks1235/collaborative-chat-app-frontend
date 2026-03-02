import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { UIProvider } from "../context/UIContext";
import { ChannelProvider } from "../context/ChannelContext";
import AppRoutes from "./routes";
import { TaskProvider } from "../context/TaskContext";
import { MessageProvider } from "../context/MessageContext";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <SocketProvider>
          <ChannelProvider>
            <TaskProvider>
              <MessageProvider>
                <AppRoutes />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                    },
                  }}
                />
              </MessageProvider>
            </TaskProvider>
          </ChannelProvider>
        </SocketProvider>
      </UIProvider>
    </AuthProvider>
  );
}
