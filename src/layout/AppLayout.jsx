import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MembersPanel from "./MembersPanel";
import ThreadPanel from "./ThreadPanel";
import SharedHeader from "../components/header/SharedHeader";
import { useUI } from "../context/UIContext";
import { useAuthContext } from "../context/AuthContext";

export default function AppLayout() {

  const { showThreadPanel } = useUI();
  const location = useLocation();
  const { user } = useAuthContext();

  const isAdminPage = location.pathname.startsWith("/admin");
  const isChannelPage = location.pathname.startsWith("/channel");

  return (
  <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">

    {/* SIDEBAR */}
    <div className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Sidebar />
    </div>

    {/* MAIN + RIGHT AREA */}
    <div className="flex flex-1 min-w-0">

      {/* MAIN SECTION */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* HEADER */}
        <SharedHeader />

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

      </div>

      {/* RIGHT PANEL */}
      {!isAdminPage && !(isChannelPage && user?.role === "Admin") && (
        <div className="hidden xl:block w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
          {showThreadPanel ? <ThreadPanel /> : <MembersPanel />}
        </div>
      )}

    </div>

  </div>
);
}