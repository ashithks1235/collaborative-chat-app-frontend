import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiSearch, FiBell, FiSettings, FiUserPlus, FiCheckCircle, FiMessageSquare, FiClipboard, FiArrowLeft} from "react-icons/fi";
import { useUI } from "../../context/UIContext";
import { useAuthContext } from "../../context/AuthContext";
import { useChannelContext } from "../../context/ChannelContext";
import { useSocketContext } from "../../context/SocketContext";
import CreateProjectModal from "../projects/CreateProjectModal";
import { useEffect, useState, useRef, useMemo } from "react";
import { getNotifications } from "../../api/notification.api";
import { getUnreadCount } from "../../api/notification.api";
import api from "../../api/axios";
import { formatDistanceToNow } from "date-fns";

export default function SharedHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAuthContext();
  const { channels } = useChannelContext();
  const { socket } = useSocketContext();
  const { addNotification, notifications, setInitialNotifications, setShowAddMember } = useUI();
  const isChannel = location.pathname.startsWith("/channel");
  const isSuperAdmin = user?.role === "Admin";
  const isAdminChannelView =
  isSuperAdmin && location.pathname.startsWith("/channel");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const isChannelSettingsPage = location.pathname.includes("/settings");

  const searchRef = useRef(null);

  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults(null);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {

    const loadUnread = async () => {
      try {
        const { unreadCount } = await getUnreadCount();
        console.log("Unread notifications:", unreadCount);
      } catch {
        console.log("Unread count load failed");
      }
    };

    loadUnread();

  }, []);

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
    if (!query.trim() || query.length < 2 || !isChannel) {
      setResults(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get(`/messages/search`, {
          params: { q: query, channelId: id },
        });

        setResults(res.data);
      } catch {
        console.log("Search failed");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, id, isChannel]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {

        const res = await getNotifications();

        if (res?.notifications) {
          setInitialNotifications(res.notifications);
        }

      } catch (err) {
        console.log("Failed to load notifications");
      }
    };

    loadNotifications();

  }, [setInitialNotifications]);

  /* ================= SOCKET NOTIFICATIONS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
      addNotification(notif);
    };

    const handleRead = (id) => {
      setInitialNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );
    };

    const handleAllRead = () => {
      setInitialNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    };

    socket.on("notification:new", handleNotification);
    socket.on("notification:read", handleRead);
    socket.on("notification:allRead", handleAllRead);

    return () => {
      socket.off("notification:new", handleNotification);
      socket.off("notification:read", handleRead);
      socket.off("notification:allRead", handleAllRead);
    };
  }, [socket, addNotification, setInitialNotifications]);

  const unreadCount =
    notifications?.filter((n) => !n.read).length || 0;

  const getNotificationIcon = (type) => {

  switch (type) {

    case "task_assigned":
      return <FiClipboard className="text-blue-500" size={16} />;

    case "task_completed":
      return <FiCheckCircle className="text-green-500" size={16} />;

    case "thread_reply":
      return <FiMessageSquare className="text-purple-500" size={16} />;

    default:
      return <FiBell className="text-gray-400" size={16} />;
  }

};

  return (
    <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center">

      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-4">
        {isChannel ? (
          <div className="flex items-center gap-3">
            <div>
              {isAdminChannelView && (
                  <button
                    onClick={() => navigate("/admin/channels")}
                    className="p-2 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <FiArrowLeft size={16} />
                  </button>
                )}
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

              {!isChannelSettingsPage && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  <FiUserPlus size={16} />
                </button>
              )}

            </div>
            )}
          </div>
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
          <div ref={searchRef} className="relative w-40 md:w-60 lg:w-80">
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

            {!loading && results?.messages?.length > 0 && (
              <div className="absolute mt-2 w-full max-h-96 overflow-y-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-3 text-sm z-50">
                {results.messages.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => {
                      navigate(`/channel/${m.channel?._id}?highlight=${m._id}&t=${Date.now()}`);
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
            {!loading && results && results.messages?.length === 0 && query.length >= 2 && (
            <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 shadow rounded-lg p-3 text-sm text-gray-500">
              No messages found
            </div>
          )}
          </div>
        )}

        {/* Notifications */}
        {!isChannel && !isSuperAdmin && (
          <div ref={notifRef} className="relative">
            <button
              onClick={async () => {
                setShowNotifications((p) => !p);
                if (!showNotifications) {
                  try {
                    await api.put("/notifications/read-all");
                      setInitialNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true }))
                      );
                  } catch {
                    console.log("Failed to mark notifications as read");
                  }
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <FiBell className="text-lg text-gray-600 dark:text-gray-300" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                className="
                absolute right-0 mt-2 w-80
                bg-white dark:bg-gray-800
                border dark:border-gray-700
                rounded-xl shadow-xl
                z-50 overflow-hidden
              "
              >
                <div className="p-3 border-b dark:border-gray-700 font-semibold text-sm">
                  Notifications
                </div>

                {notifications.length === 0 && (
                  <div className="p-4 text-sm text-gray-400 text-center">
                    No notifications
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={async () => {

                        try {
                          await api.put(`/notifications/${n._id}/read`);
                        } catch {}

                        if (n.link) {
                          navigate(n.link);
                        }

                        setShowNotifications(false);

                      }}
                      className={`p-3 text-sm border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 ${
                        !n.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >

                      {/* ICON */}
                      <div className="mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* TEXT */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {n.text}
                        </p>

                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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