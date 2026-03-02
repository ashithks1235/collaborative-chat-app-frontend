import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MembersPanel from "./MembersPanel";
import ThreadPanel from "./ThreadPanel";
import SharedHeader from "../components/header/SharedHeader";
import { useUI } from "../context/UIContext";

export default function AppLayout() {
  const { showThreadPanel } = useUI();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">

      {/* SIDEBAR */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto bg-white dark:bg-gray-800">
        <Sidebar />
      </div>

      {/* RIGHT AREA */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">

        {/* HEADER */}
        <SharedHeader />

        {/* BODY */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
        {showThreadPanel ? <ThreadPanel /> : <MembersPanel />}
      </div>

    </div>
  );
}
