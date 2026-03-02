import RecentCard from "../components/dashboard/RecentCard";
import Card from "../components/common/Card";
import Stat from "../components/common/Stat";
import NotesGrid from "../components/home/NotesGrid";
import TodayFocus from "../components/home/TodayFocus";
import useFetch from "../hooks/useFetch";
import { fetchDashboard } from "../services/dashboard.service";
import Loader from "../components/ui/Loader";
import ErrorBox from "../components/ui/ErrorBox";
import { useAuthContext } from "../context/AuthContext";
import AdminDashboard from "../components/admin/AdminDashboard";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuthContext();
  const { data, loading, error } = useFetch(fetchDashboard, []);

if (user?.role === "Admin") {
  return <AdminDashboard />;
}

if (user?.role === "Admin") {
  return <Navigate to="/admin/dashboard" replace />;
}

if (loading) return <Loader />;
if (error) return <ErrorBox message={error} />;

  const recentChats = data.channels.map(c => ({
    id: c._id,
    name: c.name,
    status: "active"
  }));

  const recentTasks = data.tasks.map(t => ({
    id: t._id,
    name: t.title,
    status:
      t.status === "done" ? "finished" :
      t.status === "doing" ? "in progress" :
      "not started",
    projectId: t.project
  }));

  const recentProjects = data.projects.map(p => ({
    id: p._id,
    name: p.name,
    status: "in progress"
  }));

  return (
    <motion.div className="h-full space-y-6 p-6 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors shadow"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}>
      <TodayFocus />
      
      {/* 🔹 RECENT SECTION */}
      <div className="grid grid-cols-3 gap-4">
        <RecentCard title="Recent Chats" items={recentChats} type="chat" />
        <RecentCard title="Recent Tasks" items={recentTasks} type="task" />
        <RecentCard title="Recent Projects" items={recentProjects} type="project" />
      </div>

      <NotesGrid />
      

      {/* 🔹 DASHBOARD STATS */}
      <Card title="Dashboard">
        <div className="grid grid-cols-3 gap-4">
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
    </motion.div>
  );
}
