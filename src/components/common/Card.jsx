export default function Card({ title, icon, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow dark:bg-gray-800 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
