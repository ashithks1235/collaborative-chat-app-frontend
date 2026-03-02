import { useEffect, useState } from "react";
import { getTodayFocus } from "../../api/focus.api";
import { useNavigate } from "react-router-dom";

export default function TodayFocus() {
  const [data, setData] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    getTodayFocus().then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="bg-white p-5 dark:bg-gray-800 shadow rounded-xl transition-colors">
      <h2 className="font-semibold text-lg mb-3"> Today Focus</h2>

      {/* TASKS */}
      {data.tasks.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-700">Tasks Due</p>
          {data.tasks.map(t => (
            <div
              key={t._id}
              onClick={() => nav("/tasks")}
              className="text-sm text-blue-600 cursor-pointer"
            >
              {t.title}
            </div>
          ))}
        </div>
      )}

      {/* MENTIONS */}
      {data.mentions.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-700">Mentions</p>
          {data.mentions.map(m => (
            <div
              key={m._id}
              onClick={() => nav(`/channel/${m.channel._id}`)}
              className="text-sm text-purple-600 cursor-pointer"
            >
              Mention in #{m.channel.name}
            </div>
          ))}
        </div>
      )}

      {/* REMINDERS */}
      {data.reminders.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">Reminders</p>
          {data.reminders.map(r => (
            <div key={r._id} className="text-sm text-yellow-600">
              {r.text}
            </div>
          ))}
        </div>
      )}

      {data.tasks.length === 0 &&
       data.mentions.length === 0 &&
       data.reminders.length === 0 && (
        <p className="text-gray-400 text-sm">Nothing scheduled today 🎉</p>
      )}
    </div>
  );
}
