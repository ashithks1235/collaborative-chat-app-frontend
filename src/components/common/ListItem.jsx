export default function ListItem({ title, meta }) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer text-sm">
      <span className="font-medium">{title}</span>
      {meta && <span className="text-xs text-gray-400">{meta}</span>}
    </div>
  );
}
