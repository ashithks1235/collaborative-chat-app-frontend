import useFetch from "../../hooks/useFetch";
import api from "../../api/axios";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";
import { useEffect, useMemo } from "react";
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
    useFetch(() => api.get("/analytics"), []);
  const safeData = data || {};

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

  /* ===============================
     TASK COMPLETION CHART
  =============================== */

  const taskChart = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [
          safeData.completedTasks || 0,
          safeData.pendingTasks || 0
        ],
        backgroundColor: ["#22c55e", "#facc15"]
      }
    ]
  };

  /* ===============================
     MESSAGES PER DAY
  =============================== */

  const chartDays = useMemo(() => {
    const dayMap = new Map();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);

      dayMap.set(key, {
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        messageCount: 0,
        messages: 0,
        tasks: 0
      });
    }

    (safeData.messagesPerDay || []).forEach((item) => {
      if (dayMap.has(item._id)) {
        const day = dayMap.get(item._id);
        day.messageCount = item.count || 0;
      }
    });

    (safeData.activityPerDay || []).forEach((item) => {
      if (dayMap.has(item._id)) {
        const day = dayMap.get(item._id);
        day.messages = item.messages || 0;
        day.tasks = item.tasks || 0;
      }
    });

    return Array.from(dayMap.values());
  }, [safeData.activityPerDay, safeData.messagesPerDay]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  const messagesChart = {
    labels: chartDays.map((day) => day.label),
    datasets: [
      {
        label: "Messages",
        data: chartDays.map((day) => day.messageCount),
        backgroundColor: "#3b82f6"
      }
    ]
  };

  /* ===============================
     REALTIME ACTIVITY
  =============================== */

  const activityChart = {
    labels: chartDays.map((day) => day.label),
    datasets: [
      {
        label: "Messages",
        data: chartDays.map((day) => day.messages),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.4
      },
      {
        label: "Tasks",
        data: chartDays.map((day) => day.tasks),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
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

        <StatCard label="Total Tasks" value={safeData.totalTasks} />

        <StatCard label="Pending Tasks" value={safeData.pendingTasks} />

        <StatCard label="Completed Tasks" value={safeData.completedTasks} />

        <StatCard
          label="Completion Rate"
          value={`${safeData.completionRate}%`}
        />

        <StatCard
          label="Active Users"
          value={safeData.activeUsers}
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
