export default function TaskItem({ title, status }) {
  const statusColor = {
    Overdue: "text-red-500",
    "In Progress": "text-yellow-500",
    Pending: "text-gray-500",
    Completed: "text-green-500",
  };

  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-sm">
      <span>{title}</span>
      <span className={`text-xs font-semibold ${statusColor[status]}`}>
        {status}
      </span>
    </div>
  );
}
