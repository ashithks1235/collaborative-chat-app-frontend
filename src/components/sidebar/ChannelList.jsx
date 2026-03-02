import { useState } from "react";
import ChannelItem from "./ChannelItem";
import { FaCirclePlus } from "react-icons/fa6";
import { useChannelContext } from "../../context/ChannelContext";
import { useAuthContext } from "../../context/AuthContext";

export default function ChannelList() {
  const { channels, addChannel, loading } = useChannelContext();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuthContext();

  const handleCreate = async () => {
    try {
      if (!name.trim()) {
        setError("Channel name required");
        return;
      }

      await addChannel(name);

      setName("");
      setShowModal(false);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create channel"
      );
    }
  };

  if (loading) {
    return <div className="text-xs text-gray-400">Loading...</div>;
  }

  return (
    <div className="mt-4 px-3">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2">
        <span>My Chatroom</span>

        {(user?.role === "Admin" || user?.role === "Moderator") && (
          <button onClick={() => setShowModal(true)}>
            <FaCirclePlus className="text-blue-500" />
          </button>
        )}
      </div>

      {channels.map((ch) => (
        <ChannelItem
          key={ch._id || ch.id}
          channel={{
            ...ch,
            _id: ch._id || ch.id
          }}
        />
      ))}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-72 space-y-3">

            <h3 className="font-semibold">Create Channel</h3>

            <input
              className="w-full border p-2 rounded"
              placeholder="channel name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
