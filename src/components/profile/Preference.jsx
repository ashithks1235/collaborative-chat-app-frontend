export default function Preference({ label }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="accent-blue-500" defaultChecked />
      {label}
    </label>
  );
}
