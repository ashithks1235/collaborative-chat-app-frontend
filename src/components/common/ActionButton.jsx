export default function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100"
    >
      {icon}
      {label}
    </button>
  );
}
