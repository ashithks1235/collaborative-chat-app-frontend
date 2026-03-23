import { lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import SharedHeader from "../components/header/SharedHeader";
import { useUI } from "../context/UIContext";
import { useAuthContext } from "../context/AuthContext";

const MembersPanel = lazy(() => import("./MembersPanel"));
const ThreadPanel = lazy(() => import("./ThreadPanel"));

function SidePanelSkeleton() {
  return (
    <div className="h-full animate-pulse space-y-4 p-4">
      <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl bg-gray-100 p-3 dark:bg-gray-800"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          <Suspense fallback={<SidePanelSkeleton />}>
            {showThreadPanel ? <ThreadPanel /> : <MembersPanel />}
          </Suspense>
        </div>
      )}

    </div>

  </div>
);
}
