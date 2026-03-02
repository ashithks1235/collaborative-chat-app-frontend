import { FiCheckCircle, FiAlertCircle, FiClipboard } from "react-icons/fi";

export default function Stat({ label, value }) {
  let icon = <FiClipboard size={20} />;
  let colorClasses = "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400";

  if (label.includes("Completed")) {
    icon = <FiCheckCircle size={20} />;
    colorClasses = "text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400";
  }

  if (label.includes("Overdue")) {
    icon = <FiAlertCircle size={20} />;
    colorClasses = "text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400";
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
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
