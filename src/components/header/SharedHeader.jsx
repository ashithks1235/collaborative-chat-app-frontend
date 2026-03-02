import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiSearch, FiBell, FiSettings, FiUserPlus } from "react-icons/fi";
import { useUI } from "../../context/UIContext";
import { useAuthContext } from "../../context/AuthContext";
import { useChannelContext } from "../../context/ChannelContext";
import { useSocketContext } from "../../context/SocketContext";
import CreateProjectModal from "../projects/CreateProjectModal";
import { useEffect, useState, useRef, useMemo } from "react";
import api from "../../api/axios";

export default function SharedHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAuthContext();
  const { channels } = useChannelContext();
  const { socket } = useSocketContext();
  const { addNotification, notifications, setShowAddMember } = useUI();

  const isChannel = location.pathname.startsWith("/channel");
  const isSuperAdmin = user?.role === "Admin";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const searchRef = useRef(null);

  /* ================= GET ACTIVE CHANNEL ================= */
  const activeChannel = useMemo(() => {
    if (!id) return null;
    return channels.find((c) => c._id === id);
  }, [channels, id]);

  /* ================= CHECK CHANNEL ADMIN ================= */
  const isChannelAdmin = useMemo(() => {
    if (!activeChannel) return false;

    return activeChannel.members?.some(
      (m) =>
        (typeof m.user === "string"
          ? m.user === user?._id
          : m.user?._id === user?._id) &&
        m.role === "admin"
    );
  }, [activeChannel, user]);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!query.trim() || !isChannel) {
      setResults(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get(`/messages/search`, {
          params: { q: query, channelId: id },
        });

        setResults(res.data?.data);
      } catch {
        console.log("Search failed");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, id, isChannel]);

  /* ================= SOCKET NOTIFICATIONS ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (notif) => {
      addNotification(notif);
    });

    return () => socket.off("notification:new");
  }, [socket]);

  const unreadCount =
    notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center">

      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-4">
        {isChannel ? (
          <>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                # {activeChannel?.name || "Loading..."}
              </h2>
              <p className="text-xs text-gray-400">
                Team conversation
              </p>
            </div>

            {/* Channel Admin Controls */}
            {isChannelAdmin && !isSuperAdmin && (
              <div className="flex items-center gap-2 ml-4">

              {/* NEW PROJECT BUTTON */}
              <button
                onClick={() => setShowCreateProject(true)}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                + Project
              </button>

              <button
                onClick={() => navigate(`/channel/${id}/settings`)}
                className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FiSettings size={16} />
              </button>

              <button
                onClick={() => setShowAddMember(true)}
                className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                <FiUserPlus size={16} />
              </button>

            </div>
            )}
          </>
        ) : (
          <h2 className="text-lg font-semibold">
            Hello, {user?.name}
          </h2>
        )}
      </div>

      {/* ================= RIGHT ================= */}
      <div className="ml-auto flex items-center gap-4">

        {/* Channel Search */}
        {isChannel && (
          <div ref={searchRef} className="relative w-80">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border
                border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-gray-800 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loading && (
              <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 shadow rounded-lg p-3 text-sm">
                Searching...
              </div>
            )}

            {results?.messages?.length > 0 && (
              <div className="absolute mt-2 w-full max-h-96 overflow-y-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-3 text-sm z-50">
                {results.messages.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => {
                      navigate(`/channel/${m.channel?._id}`);
                      setResults(null);
                      setQuery("");
                    }}
                    className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <p className="truncate">{m.text}</p>
                    <span className="text-xs text-gray-400">
                      in #{m.channel?.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        {!isChannel && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications((p) => !p)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <FiBell className="text-lg text-gray-600 dark:text-gray-300" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {showCreateProject && (
      <CreateProjectModal
        channelId={id}
        onClose={() => setShowCreateProject(false)}
        onSuccess={(project) => {
          setShowCreateProject(false);
          navigate(`/projects/${project._id}`);
        }}
      />
    )}
    </div>
  );
}