import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ChannelActivity({ channelId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!channelId) {
      setActivities([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchActivities = async () => {
      try {
        const res = await api.get(`/channels/${channelId}/activity`);

        const activityData = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        if (isMounted) {
          setActivities(activityData);
        }

      } catch (err) {
        console.error("Failed to load activity:", err);
        if (isMounted) {
          setActivities([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  if (loading) {
    return (
      <div className="flex-1 p-6 text-sm text-gray-400">
        Loading activity...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      {activities.length === 0 && (
        <p className="text-gray-400 text-sm">No activity yet</p>
      )}

      {activities.map((a) => (
        <div
          key={a._id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-800 dark:text-gray-100">
            {renderActivity(a)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {new Date(a.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

/* 🔥 Activity Formatter */
function renderActivity(a) {
  const user = a.user?.name || "Someone";

  switch (a.type) {
    case "task_created":
      return `${user} created task "${a.meta?.title || ""}"`;

    case "task_completed":
      return `${user} completed a task`;

    case "task_updated":
      return `${user} updated a task`;

    case "message_converted":
      return `${user} converted a message into a task`;

    default:
      return `${user} did something`;
  }
}
