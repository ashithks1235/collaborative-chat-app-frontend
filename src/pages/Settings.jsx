export default function Settings() {
  return (
    <div className="p-6 bg-gray-50 h-full">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>

        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Enable notifications
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Dark mode
          </label>
        </div>
      </div>
    </div>
  );
}
