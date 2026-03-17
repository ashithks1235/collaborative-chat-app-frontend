import useFetch from "../../hooks/useFetch";
import api from "../../api/axios";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminChannels() {

  const navigate = useNavigate();
  const [processing, setProcessing] = useState(null);
  const [search, setSearch] = useState("");

  const {
    data: channels,
    loading,
    error,
    refetch,
  } = useFetch(() =>
    api.get("/admin/channels").then((res) => res.data),
    []
  );

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  const filteredChannels =
    channels?.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const deleteChannel = async (id) => {

    if (!window.confirm("Delete this channel permanently?")) return;

    try {
      setProcessing(id);
      await api.delete(`/channels/${id}`);
      toast.success("Channel deleted");
      refetch();
    } catch {
      toast.error("Delete failed");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h2 className="text-2xl font-semibold">
          All Channels
        </h2>

        <input
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64 dark:bg-gray-800"
        />

      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl">

        {filteredChannels.length === 0 && (
          <p className="p-6 text-sm text-gray-500">
            No channels found
          </p>
        )}

        {filteredChannels.map((c) => (

          <div
            key={c._id}
            className="flex justify-between items-center px-6 py-4 drop-shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >

            {/* CHANNEL INFO */}
            <div>

              <div className="font-medium">
                #{c.name}
              </div>

              <div className="text-xs text-gray-500">
                {c.members?.length || 0} members
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Created by: {c.createdBy?.name || "Unknown"}
              </div>

              <div className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">

              <button
                onClick={() => navigate(`/channel/${c._id}`)}
                className="bg-blue-600 text-sm text-white py-1 px-4 rounded-2xl hover:bg-blue-700"
              >
                View
              </button>

              <button
                disabled={processing === c._id}
                onClick={() => deleteChannel(c._id)}
                className="bg-red-500 text-sm text-white py-1 px-4 rounded-2xl hover:bg-red-600"
              >
                {processing === c._id ? "Deleting..." : "Delete"}
              </button>

            </div>

          </div>

        ))}

      </div>
    </div>
  );
}