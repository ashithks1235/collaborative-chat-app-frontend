import { useNavigate } from "react-router-dom";

export default function RecentCard({ title, items, type }) {
  const navigate = useNavigate();

  const go = (item) => {
    if (type === "chat") navigate(`/channel/${item.id}`);
    if (type === "task") navigate(`/projects/${item.projectId}`);
    if (type === "project") navigate(`/projects/${item.id}`);
  };

  const color = (status) => {
    if (status === "finished") return "text-green-600";
    if (status === "in progress") return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 transition-colors">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => go(item)}
            className="flex justify-between text-sm p-2 rounded hover:bg-gray-100 cursor-pointer"
          >
            <span className="font-medium">{item.name}</span>
            <span className={`text-xs font-semibold ${color(item.status)}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
