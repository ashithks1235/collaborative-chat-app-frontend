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
      <h2 className="text-2xl font-semibold">All Channels</h2>

      <div className="bg-white shadow rounded-xl p-4 space-y-4">
        {channels?.length === 0 && (
          <p className="text-sm text-gray-500">
            No channels found
          </p>
        )}

        {channels?.map((c) => (
          <div
            key={c._id}
            className="flex justify-between items-center border-b pb-3"
          >
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

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/channel/${c._id}`)}
                className="text-sm text-blue-600"
              >
                View
              </button>

              <button
                disabled={processing === c._id}
                onClick={() => deleteChannel(c._id)}
                className="text-sm text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
