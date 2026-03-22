import { useEffect, useState } from "react";
import { getChannelById } from "../api/channel.api";
import { useParams, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { FiChevronDown } from "react-icons/fi";
import api from "../api/axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { startOfWeek, addDays, format } from "date-fns";
import RoleBadge from "../components/common/RoleBadge";
import { useSocketContext } from "../context/SocketContext";
import getFileUrl from "../utils/getFileUrl";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MembersPanel() {
  const { id } = useParams();
  const location = useLocation();
  const { user, authReady } = useAuthContext();
  const { socket, onlineUsers } = useSocketContext();

  const [members, setMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [showOffline, setShowOffline] = useState(false);

  const [chartData, setChartData] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0
  });
  const validMembers = members.filter((member) => member?.user?._id);

  const inChannel = location.pathname.startsWith("/channel/");

  if (user?.role === "Admin") {
  return null;
}

  useEffect(() => {
    if (!authReady) return;
    if (inChannel) return;
    if (!user) return;

    const loadAnalytics = async () => {
      try {
        const res = await api.get("/analytics");

        const data = res.data || {};

        setChartData({
          completed: data.completedTasks || 0,
          inProgress: data.inProgressTasks || 0,
          pending: data.pendingTasks || 0
        });

      } catch (err) {
        console.error("Analytics load failed", err);
      }
    };

    loadAnalytics();
  }, [authReady, user, inChannel]);

  /* ================= REALTIME ANALYTICS ================= */

  useEffect(() => {
  if (!socket || !authReady || inChannel) return;

  const refreshAnalytics = async () => {

    setTimeout(async () => {
      try {
        const res = await api.get("/analytics");

        const data = res.data || {};

        setChartData({
          completed: data.completedTasks || 0,
          inProgress: data.inProgressTasks || 0,
          pending: data.pendingTasks || 0
        });

      } catch (err) {
        console.error("Realtime analytics update failed");
      }
    }, 150);
  };

  socket.on("task:created", refreshAnalytics);
  socket.on("task:moved", refreshAnalytics);
  socket.on("task:deleted", refreshAnalytics);
  socket.on("subtask:updated", refreshAnalytics);

  return () => {
    socket.off("task:created", refreshAnalytics);
    socket.off("task:moved", refreshAnalytics);
    socket.off("task:deleted", refreshAnalytics);
    socket.off("subtask:updated", refreshAnalytics);
  };

}, [socket, inChannel]);

  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i)
  );

  const formatDate = (d) => new Date(d).toDateString();

  /* ================= CHANNEL MEMBERS MODE ================= */
  useEffect(() => {
    if (!inChannel || !id) return;

    getChannelById(id).then((data) => {
      const safeMembers = Array.isArray(data.members)
        ? data.members.filter((member) => member?.user?._id)
        : [];
      setMembers(safeMembers);
    });
  }, [id, inChannel]);

  /* ================= USER DASHBOARD MODE ================= */
  useEffect(() => {
    if (inChannel) return;

    const loadDashboard = async () => {
      try {
        const r = await api.get("/reminders");
        setReminders(r.data);
      } catch {
        console.log("Dashboard load failed");
      }
    };

    loadDashboard();
  }, [inChannel]);

  const sortedMembers = [...validMembers].sort((a, b) => {
    const aOnline = onlineUsers.includes(a.user?._id);
    const bOnline = onlineUsers.includes(b.user?._id);

    if (aOnline === bOnline) return 0;
    return aOnline ? -1 : 1; // online first
  });

/* ================= MODE 1: CHANNEL ================= */
if (inChannel) {

  /* ---------- SORT MEMBERS ---------- */
  const sortedMembers = [...validMembers].sort((a, b) => {
    const aUser = a.user;
    const bUser = b.user;

    const aIsYou = aUser?._id === user?._id;
    const bIsYou = bUser?._id === user?._id;

    if (aIsYou) return -1;
    if (bIsYou) return 1;

    const aIsAdmin = a.role === "admin";
    const bIsAdmin = b.role === "admin";

    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;

    const aOnline = onlineUsers.includes(aUser?._id);
    const bOnline = onlineUsers.includes(bUser?._id);

    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;

    return 0;
  });

  const onlineCount = validMembers.filter(m =>
    onlineUsers.includes(m.user?._id)
  ).length;

  const offlineCount = validMembers.length - onlineCount;

  return (
    <div className="h-full overflow-y-auto p-4 bg-white dark:bg-gray-900 transition-colors">

      <h3 className="font-bold mb-4 flex items-center justify-between text-gray-800 dark:text-gray-100">
        Channel Members
        <span className="text-xs text-gray-400">
          {validMembers.length} members
        </span>
      </h3>

      {/* ================= ONLINE SECTION ================= */}
      <div className="mb-6">
        <h4 className="text-xs uppercase tracking-wide text-green-500 font-semibold mb-3">
          Online ({onlineCount})
        </h4>

        {sortedMembers
          .filter(m => onlineUsers.includes(m.user?._id))
          .map((memberObj, i) => {
            const u = memberObj.user;
            const isCurrentUser = u?._id === user?._id;

            return (
              <div
                key={u?._id || i}
                className={`p-3 flex items-center justify-between text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                  isCurrentUser ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">

                  {/* Avatar + Online Dot */}
                  <div className="relative">
                    <img
                      src={
                        getFileUrl(u?.avatar) ||
                        `https://ui-avatars.com/api/?name=${u?.name}`
                      }
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                  </div>

                  <div className="min-w-0 flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {u?.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-500">
                          (You)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-green-500">
                      Online
                    </span>
                  </div>
                </div>

                {/* ✅ Channel Role Only */}
                <div className="ml-3 shrink-0">
                  <RoleBadge role={memberObj.role} />
                </div>
              </div>
            );
          })}
      </div>

      {/* ================= OFFLINE SECTION ================= */}
      <div>
        <button
          onClick={() => setShowOffline(!showOffline)}
          className="w-full flex items-center justify-between text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <span>Offline ({offlineCount})</span>

          <FiChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              showOffline ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            showOffline ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          {sortedMembers
            .filter(m => !onlineUsers.includes(m.user?._id))
            .map((memberObj, i) => {
              const u = memberObj.user;
              const isCurrentUser = u?._id === user?._id;

              return (
                <div
                  key={u?._id || i}
                  className={`p-3 flex items-center justify-between text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                    isCurrentUser ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">

                    {/* Avatar + Offline Dot */}
                    <div className="relative">
                      <img
                        src={
                          getFileUrl(u?.avatar) ||
                          `https://ui-avatars.com/api/?name=${u?.name}`
                        }
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gray-400 border-2 border-white dark:border-gray-900" />
                    </div>

                    <div className="min-w-0 flex flex-col">
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {u?.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-500">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">
                        Offline
                      </span>
                    </div>
                  </div>

                  <div className="ml-3 shrink-0">
                    <RoleBadge role={memberObj.role} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

  /* ================= MODE 2: USER DASHBOARD ================= */

  return (
    <div className="p-4 space-y-6">

      {/* ================= PROFILE CARD ================= */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-5 shadow rounded-2xl transition-all duration-300 hover:shadow-lg">

        <div className="flex items-center gap-4">

          {/* Avatar + Online Indicator */}
          <div className="relative">
            <img
              src={
                getFileUrl(user?.avatar) ||
                `https://ui-avatars.com/api/?name=${user?.name}`
              }
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow"
            />

            {/* 🟢 Online Pulse Indicator */}
            <span className="absolute bottom-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-1">

            <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
              {user?.name}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>

            {/* Role Badge Mapping */}
            <RoleBadge
              role={
                user?.role === "Admin"
                  ? "Admin"        // Super Admin (platform owner)
                  : user?.role === "Moderator"
                  ? "ChannelAdmin" // Shows as Admin
                  : "Member"
              }
            />
          </div>

        </div>
      </div>


      {/* TASK ANALYTICS */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 transition-colors">
        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Task Analytics
        </h3>

        <Doughnut
          data={{
            labels: ["Completed", "In Progress", "Pending"],
            datasets: [
              {
                data: [
                  chartData.completed,
                  chartData.inProgress,
                  chartData.pending
                ],
                backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
                borderWidth: 0,
              },
            ],
          }}
          options={{
            animation: {
              duration: 700,
              easing: "easeOutQuart"
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: { boxWidth: 12 },
              },
            },
            cutout: "70%",
          }}
        />

        {chartData.completed === 0 &&
        chartData.inProgress === 0 &&
        chartData.pending === 0 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            No tasks assigned yet
          </p>
        )}
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 transition-colors">

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Calendar
          </h3>

          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-gray-500 hover:text-black dark:hover:text-white transition"
          >
            <FiChevronDown
              className={`transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {expanded ? (
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="border-none w-full"
          />
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                onClick={() => setSelectedDate(day)}
                className="cursor-pointer text-xs text-center py-2"
              >
                <p className="font-semibold text-gray-600 dark:text-gray-300">
                  {format(day, "EEE")}
                </p>

                <p
                  className={`mt-1 w-8 h-8 flex items-center justify-center mx-auto transition-all duration-200 ${
                    formatDate(day) === formatDate(selectedDate)
                      ? "bg-blue-500 text-white rounded-full shadow"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  }`}
                >
                  {format(day, "d")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
