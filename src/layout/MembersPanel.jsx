import members from "../mock/members";

export default function MembersPanel() {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">All Members</h3>

      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
          >
            <div>
              <p className="font-medium text-sm">{m.name}</p>
              <p className={`text-xs ${m.online ? "text-green-600" : "text-gray-400"}`}>
                {m.online ? "Online" : "Offline"}
              </p>
            </div>
            <span
              className={`w-3 h-3 rounded-full ${
                m.online ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
