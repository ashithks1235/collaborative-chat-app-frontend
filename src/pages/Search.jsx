import { useState } from "react";
import { globalSearch } from "../api/search.api";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const nav = useNavigate();

  const search = async () => {
    const data = await globalSearch(q);
    setResult(data);
  };

  return (
    <div className="p-6 max-w-3xl">

      <input
        className="w-full border p-2 rounded mb-3"
        placeholder="Search everything..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <button
        onClick={search}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Search
      </button>

      {result && (
        <div className="mt-4 space-y-3">

          <h3 className="font-bold">Channels</h3>
          {result.channels.map(c => (
            <div
              key={c._id}
              onClick={() => nav(`/channel/${c._id}`)}
              className="border p-2 cursor-pointer"
            >
              # {c.name}
            </div>
          ))}

          <h3 className="font-bold">Messages</h3>
          {result.messages.map(m => (
            <div key={m._id} className="border p-2">
              {m.text} — in #{m.channel?.name}
            </div>
          ))}

          <h3 className="font-bold">Users</h3>
          {result.users.map(u => (
            <div key={u._id} className="border p-2">
              {u.username}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
