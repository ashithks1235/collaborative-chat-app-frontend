import useFetch from "../../hooks/useFetch";
import api from "../../api/axios";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";
import { useEffect } from "react";
import { useSocketContext } from "../../context/SocketContext";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
} from "chart.js";

import { Doughnut, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default function AdminAnalytics() {

  const { data, loading, error, refetch } =
    useFetch(() => api.get("/analytics").then(res => res.data), []);

  const { socket } = useSocketContext();

  /* ===============================
     REALTIME UPDATE
  =============================== */
  useEffect(() => {

    if (!socket) return;

    const handleUpdate = () => refetch();

    socket.on("admin:update", handleUpdate);

    return () => socket.off("admin:update", handleUpdate);

  }, [socket, refetch]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  /* ===============================
     TASK COMPLETION CHART
  =============================== */

  const taskChart = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [
          data.completedTasks || 0,
          data.pendingTasks || 0
        ],
        backgroundColor: ["#22c55e", "#facc15"]
      }
    ]
  };

  /* ===============================
     MESSAGES PER DAY
  =============================== */

  const messagesChart = {
    labels: data.messagesPerDay?.map(d => d._id) || [],
    datasets: [
      {
        label: "Messages",
        data: data.messagesPerDay?.map(d => d.count) || [],
        backgroundColor: "#3b82f6"
      }
    ]
  };

  /* ===============================
     REALTIME ACTIVITY
  =============================== */

  const activityChart = {
    labels: data.activityPerDay?.map(d => d._id) || [],
    datasets: [
      {
        label: "Messages",
        data: data.activityPerDay?.map(d => d.messages) || [],
        borderColor: "#3b82f6",
        tension: 0.4
      },
      {
        label: "Tasks",
        data: data.activityPerDay?.map(d => d.tasks) || [],
        borderColor: "#22c55e",
        tension: 0.4
      }
    ]
  };

  return (
    <div className="p-6 space-y-8">

      <h2 className="text-2xl font-semibold">
        Task Analytics
      </h2>

      {/* ===============================
          KPI STATS
      =============================== */}

      <div className="grid grid-cols-5 gap-6">

        <StatCard label="Total Tasks" value={data.totalTasks} />

        <StatCard label="Pending Tasks" value={data.pendingTasks} />

        <StatCard label="Completed Tasks" value={data.completedTasks} />

        <StatCard
          label="Completion Rate"
          value={`${data.completionRate}%`}
        />

        <StatCard
          label="Active Users"
          value={data.activeUsers}
        />

      </div>

      {/* ===============================
          CHARTS
      =============================== */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* TASK COMPLETION */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">

          <h3 className="font-semibold mb-4">
            Task Completion
          </h3>

          <div className="w-64 mx-auto">

            <Doughnut
              data={taskChart}
              options={{
                plugins: { legend: { position: "bottom" } },
                cutout: "70%"
              }}
            />

          </div>

        </div>


        {/* MESSAGES PER DAY */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">

          <h3 className="font-semibold mb-4">
            Messages Per Day
          </h3>

          <Bar
            data={messagesChart}
            options={{
              plugins: { legend: { display: false } }
            }}
          />

        </div>

      </div>


      {/* ===============================
          REALTIME ACTIVITY CHART
      =============================== */}

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">

        <h3 className="font-semibold mb-4">
          Real-time Activity
        </h3>
          <div className="max-w-3xl mx-auto">
            <Line
              data={activityChart}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" }
                }
              }}
            />
          </div>
      </div>

    </div>
  );
}

/* ===============================
   KPI CARD
=============================== */

function StatCard({ label, value }) {

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-2xl font-semibold mt-1">
        {value}
      </p>

    </div>
  );

}