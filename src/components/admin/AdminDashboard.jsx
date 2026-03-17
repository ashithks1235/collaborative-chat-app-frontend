import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { fetchAdminOverview } from "../../services/admin.service";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";
import Stat from "../common/Stat";
import { useSocketContext } from "../../context/SocketContext";
import {
  FiUser,
  FiMessageCircle,
  FiHash,
  FiCheckSquare,
  FiUpload,
  FiActivity
} from "react-icons/fi";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";

import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  PointElement,
  LineElement);

export default function AdminDashboard() {

  const { data, loading, error, refetch } = useFetch(fetchAdminOverview, []);
  const { socket } = useSocketContext();

  const [liveUsers, setLiveUsers] = useState(data?.liveUsers || 0);
  const [liveEvents, setLiveEvents] = useState([]);

  /* ===============================
     SOCKET LISTENERS
  =============================== */
  useEffect(() => {

    if (!socket) return;

    const handleAdminUpdate = () => {
      refetch();
    };

    const handleOnlineUsers = (users) => {
      setLiveUsers(users.length);
    };

    const handleSystemEvent = (event) => {
      setLiveEvents(prev => [
        event,
        ...prev.slice(0, 9)
      ]);
    };

    socket.on("admin:update", handleAdminUpdate);
    socket.on("users:online", handleOnlineUsers);
    socket.on("activity:new", handleAdminUpdate);
    socket.on("system:event", handleSystemEvent);

    return () => {
      socket.off("admin:update", handleAdminUpdate);
      socket.off("users:online", handleOnlineUsers);
      socket.off("activity:new", handleAdminUpdate);
      socket.off("system:event", handleSystemEvent);
    };

  }, [socket, refetch]);

  const getActivityIcon = (type) => {

  const map = {
    user_registered: <FiUser className="text-blue-500" />,
    message_sent: <FiMessageCircle className="text-green-500" />,
    channel_created: <FiHash className="text-purple-500" />,
    task_created: <FiCheckSquare className="text-yellow-500" />,
    file_uploaded: <FiUpload className="text-indigo-500" />
  };

  return map[type] || <FiActivity className="text-gray-400" />;
};

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  const analyticsData = {
    labels: ["Completed Tasks", "Pending Tasks"],
    datasets: [
      {
        data: [
          data.completedTasks || 0,
          (data.totalTasks || 0) - (data.completedTasks || 0)
        ],
        backgroundColor: ["#22c55e", "#facc15"],
        borderWidth: 0
      }
    ]
  };

  const weeklyData = data.weeklyAnalytics || { messages: [], tasks: [] };

  const labels = weeklyData.messages.map(m =>
    new Date(m._id).toLocaleDateString("en-US", { weekday: "short" })
  );

  const weeklyChartData = {
    labels,
    datasets: [
      {
        label: "Messages",
        data: weeklyData.messages.map(m => m.count),
        borderColor: "#3b82f6",
        tension: 0.4
      },
      {
        label: "Tasks",
        data: weeklyData.tasks.map(t => t.count),
        borderColor: "#22c55e",
        tension: 0.4
      }
    ]
  };

  return (

    <div className="p-6 space-y-8">

      {/* HEADER */}
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        System Control Center
      </h2>


      {/* SYSTEM STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Stat label="Users" value={data.totalUsers} color="blue" />
        <Stat label="Channels" value={data.totalChannels} color="green" />
        <Stat label="Tasks" value={data.totalTasks} color="yellow" />
        <Stat label="Messages" value={data.totalMessages} color="purple" />

      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">

        <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Weekly Activity
        </h3>

        <div className="max-w-3xl mx-auto">
          <Line
            data={weeklyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { position: "bottom" }
              }
            }}
          />
        </div>
      </div>

      {/* ANALYTICS + SYSTEM HEALTH */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* SYSTEM ANALYTICS */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">

          <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">
            System Analytics
          </h3>

          <div className="w-64 mx-auto">

            <Doughnut
              data={analyticsData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom"
                  }
                },
                cutout: "70%"
              }}
            />

          </div>

        </div>


        {/* SYSTEM HEALTH */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">

          <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">
            System Health
          </h3>

          <div className="space-y-3 text-sm">

            <HealthRow
              label="Live Users"
              value={liveUsers || data.liveUsers || 0}
              color="green"
            />

            <HealthRow
              label="Messages Today"
              value={data.messagesToday || 0}
              color="blue"
            />

            <HealthRow
              label="Tasks Created Today"
              value={data.tasksToday || 0}
              color="yellow"
            />

            <HealthRow
              label="System Status"
              value={data.systemStatus || "Healthy"}
              color="green"
            />

          </div>

        </div>

      </div>


      {/* RECENT ACTIVITY */}

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">
        <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Live System Events
        </h3>
        <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
          {liveEvents.length === 0 && (
            <p className="text-gray-400">
              Waiting for events...
            </p>
          )}

          {liveEvents.map((e, i) => (

            <div key={i} className="flex gap-3">
              <div className="text-lg">
                {getActivityIcon(e.type)}
              </div>

              <div>
                <div className="font-medium">
                  {e.type.replace("_", " ")}
                </div>

                <div className="text-xs text-gray-400">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===============================
   SYSTEM HEALTH ROW
=============================== */

function HealthRow({ label, value, color }) {

  const colors = {
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600"
  };

  return (
    <div className="flex justify-between">

      <span className="text-gray-600 dark:text-gray-300">
        {label}
      </span>

      <span className={`font-semibold ${colors[color]}`}>
        {value}
      </span>

    </div>
  );
}