export default function ProfileCard({ title, icon, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow space-y-4">
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}
