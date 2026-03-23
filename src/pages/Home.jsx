import { lazy, Suspense, useEffect, useState } from "react";
import RecentCard from "../components/dashboard/RecentCard";
import Card from "../components/common/Card";
import Stat from "../components/common/Stat";
import useFetch from "../hooks/useFetch";
import { fetchDashboard } from "../services/dashboard.service";
import ErrorBox from "../components/ui/ErrorBox";
import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const TodayFocus = lazy(() => import("../components/home/TodayFocus"));
const NotesGrid = lazy(() => import("../components/home/NotesGrid"));

function HomeCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl bg-white p-5 shadow dark:bg-gray-700/60"
        >
          <div className="mb-4 h-4 w-28 rounded bg-gray-200 dark:bg-gray-600" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
        </div>
      ))}
    </div>
  );
}

function WidgetSkeleton({ height = "h-40" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white p-5 shadow dark:bg-gray-700/60 ${height}`}>
      <div className="mb-4 h-4 w-32 rounded bg-gray-200 dark:bg-gray-600" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600" />
        <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-600" />
        <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-gray-600" />
      </div>
    </div>
  );
}

function HomeStatsSkeleton() {
  return (
    <Card title="Dashboard">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-3 h-4 w-28 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Home() {
  const { user } = useAuthContext();
  const { data, loading } = useFetch(fetchDashboard, []);
  const [showSecondaryWidgets, setShowSecondaryWidgets] = useState(false);

  useEffect(() => {
    if (loading) {
      setShowSecondaryWidgets(false);
      return;
    }

    let timeoutId;
    const rafId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        setShowSecondaryWidgets(true);
      }, 0);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [loading]);

if (user?.role === "Admin") {
  return <Navigate to="/admin/dashboard" replace />;
}

if (loading) {
  return (
    <div className="min-h-full space-y-6 bg-gray-50 p-6 text-gray-800 transition-colors dark:bg-gray-800 dark:text-gray-100">
      <WidgetSkeleton />
      <HomeCardSkeleton />
      <HomeStatsSkeleton />
    </div>
  );
}

if (!data || !data.channels) {
  return <ErrorBox message="Invalid dashboard data" />;
}

  const recentChats = (data?.channels || []).map(c => ({
    id: c._id,
    name: c.name,
    status: "active"
  }));

  const recentTasks = (data?.tasks || []).map(t => ({
    id: t._id,
    name: t.title,
    status:
      t.status === "done" ? "finished" :
      t.status === "doing" ? "in progress" :
      "not started",
    projectId: t.project
  }));

  const recentProjects = (data?.projects || []).map(p => ({
    id: p._id,
    name: p.name,
    status: "in progress"
  }));

  return (
    <div className="min-h-full space-y-6 bg-gray-50 p-6 text-gray-800 transition-opacity duration-200 dark:bg-gray-800 dark:text-gray-100">
      {showSecondaryWidgets ? (
        <Suspense fallback={<WidgetSkeleton />}>
          <TodayFocus />
        </Suspense>
      ) : (
        <WidgetSkeleton />
      )}
      
      {/* 🔹 RECENT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <RecentCard title="Recent Chats" items={recentChats} type="chat" />
        <RecentCard title="Recent Tasks" items={recentTasks} type="task" />
        <RecentCard title="Recent Projects" items={recentProjects} type="project" />
      </div>

      {showSecondaryWidgets ? (
        <Suspense fallback={<WidgetSkeleton height="h-64" />}>
          <NotesGrid />
        </Suspense>
      ) : (
        <WidgetSkeleton height="h-64" />
      )}
      

      {/* 🔹 DASHBOARD STATS */}
      <Card title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat 
            label="Total Tasks Assigned to Me" 
            value={data.stats.totalTasks} 
          />
          <Stat 
            label="Completed Tasks" 
            value={data.stats.completedTasks} 
          />
          <Stat 
            label="Overdue Tasks" 
            value={data.stats.overdueTasks} 
          />
        </div>
      </Card>
    </div>
  );
}
