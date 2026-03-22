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
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Create Channel
                </h3>
                <p className="text-sm text-gray-500">
                  Channels help organize conversations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Channel Name
                </label>
                <input
                  className="
                  w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                  bg-white dark:bg-gray-800 dark:border-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                  placeholder="e.g. marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreate}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                >
                  Create Channel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
