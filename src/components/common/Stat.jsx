import {
  FiUsers,
  FiHash,
  FiCheckSquare,
  FiMessageCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiClipboard
} from "react-icons/fi";

export default function Stat({ label, value, color }) {

  let icon = <FiClipboard size={20} />;
  let colorClasses =
    "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400";

  /* ===============================
     ADMIN DASHBOARD STATS
  =============================== */

  if (label === "Users") {
    icon = <FiUsers size={20} />;
  }

  if (label === "Channels") {
    icon = <FiHash size={20} />;
  }

  if (label === "Tasks") {
    icon = <FiCheckSquare size={20} />;
  }

  if (label === "Messages") {
    icon = <FiMessageCircle size={20} />;
  }

  /* ===============================
     OTHER STATS (optional reuse)
  =============================== */

  if (label.includes("Completed")) {
    icon = <FiCheckCircle size={20} />;
  }

  if (label.includes("Overdue")) {
    icon = <FiAlertCircle size={20} />;
  }

  /* ===============================
     COLOR SUPPORT
  =============================== */

  const colors = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400",
    green: "text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400",
    yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-400",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400"
  };

  if (color && colors[color]) {
    colorClasses = colors[color];
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow transition-colors">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </p>

          <p className="text-2xl font-bold mt-1">
            {value}
          </p>
        </div>

        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full ${colorClasses}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}