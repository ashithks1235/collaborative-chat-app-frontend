import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuthContext } from "../../context/AuthContext";
import RoleBadge from "../../components/common/RoleBadge";
import toast from "react-hot-toast";
import { FiChevronDown, FiArrowLeft } from "react-icons/fi";

export default function ChannelSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [channel, setChannel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /* ================= LOAD CHANNEL ================= */
  useEffect(() => {
    const loadChannel = async () => {
      try {
        const res = await api.get(`/channels/${id}`);
        setChannel(res.data);
        setNewName(res.data.name);
      } catch {
        toast.error("Failed to load channel");
      }
    };

    loadChannel();
  }, [id]);

  if (!channel) return null;

  /* ================= CHECK CHANNEL ADMIN ================= */
  const isChannelAdmin = channel.members.some(
    (m) =>
      m.user._id === user._id &&
      m.role === "admin"
  );

  if (!isChannelAdmin) {
    return (
      <div className="p-6">
        <p>You are not allowed to manage this channel.</p>
      </div>
    );
  }

  /* ================= ACTIONS ================= */

  const handleRename = async () => {
    try {
      await api.put(`/channels/${id}`, { name: newName });
      toast.success("Channel renamed");
      setChannel({ ...channel, name: newName });
      setShowEditModal(false);
    } catch {
      toast.error("Rename failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this channel permanently?")) return;

    try {
      await api.delete(`/channels/${id}`);
      toast.success("Channel deleted");
      navigate("/");
    } catch {
      toast.error("Delete failed");
    }
  };

  const promoteUser = async (userId) => {
    try {
      await api.put(`/channels/${id}/promote/${userId}`);
      toast.success("Promoted");
      window.location.reload();
    } catch {
      toast.error("Promotion failed");
    }
  };

  const removeUser = async (userId) => {
    try {
      await api.delete(`/channels/${id}/members/${userId}`);
      toast.success("Member removed");
      window.location.reload();
    } catch {
      toast.error("Remove failed");
    }
  };

  console.log(channel.members);

  return (
    <div className="p-8 space-y-8 max-w-4xl bg-white">

        {/* ================= BACK TO CHANNEL ================= */}
        <div className="flex items-center gap-3 mb-6">
        <button
            onClick={() => navigate(`/channel/${id}`)}
            className="flex items-center gap-2 text-sm 
                    text-gray-600 dark:text-gray-300
                    hover:text-blue-600 transition"
        >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to Channel
        </button>
        </div>

      {/* ================= CHANNEL INFO ================= */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6 transition hover:shadow-lg">

        <h3 className="text-lg font-semibold">Channel Info</h3>

        <div className="flex items-center justify-between pb-4">
            <div>
            <h2 className="text-2xl font-bold">
                # {channel.name}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
                Created by{" "}
                <span className="font-medium">
                {channel.createdBy?.name}
                </span>
            </p>

            <p className="text-sm text-gray-500">
                {new Date(channel.createdAt).toLocaleString()}
            </p>
            </div>

            {/* Chevron Toggle */}
            <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-full 
                            hover:bg-gray-100 dark:hover:bg-gray-700
                            transition"
                >
                <FiChevronDown
                    size={22}
                    className={`transition-transform duration-300 ${
                    isEditing ? "rotate-180 text-blue-500" : ""
                    }`}
                />
                </button>
        </div>

        {/* ================= EXPANDED EDIT SECTION ================= */}
        {isEditing && (
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isEditing ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
                >
                <div className="space-y-6 border-t pt-6">

                    {/* Rename */}
                    <div className="space-y-2">
                    <label className="text-sm text-gray-500">
                        Channel Name
                    </label>

                    <div className="flex gap-3">
                        <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 p-2 border rounded 
                                    dark:bg-gray-700
                                    focus:ring-2 focus:ring-blue-400
                                    transition"
                        />

                        <button
                        onClick={handleRename}
                        disabled={!newName || newName === channel.name}
                        className="bg-blue-500 text-white px-4 py-2 rounded
                                    hover:bg-blue-600
                                    disabled:opacity-50
                                    transition"
                        >
                        Save
                        </button>
                    </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t pt-4">
                    <p className="text-red-600 font-medium mb-3">
                        Danger Zone
                    </p>

                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded
                                hover:bg-red-700
                                transition"
                    >
                        Delete Channel
                    </button>
                    </div>

                </div>
                </div>
        )}
        </div>


      {/* ================= MEMBERS ================= */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 space-y-4 transition-colors">

        <h3 className="font-semibold text-lg">
            Members ({channel.members.length})
        </h3>

        {channel.members.map((memberObj) => {
            const u = memberObj.user;
            const channelRole = memberObj.role;
            const isSelf = u._id === user._id;

            return (
            <div
                key={u._id}
                className="flex justify-between items-center border-b py-3"
            >
                <div className="space-y-1">
                <p className="font-medium">
                    {u.name}
                    {isSelf && " (You)"}
                </p>

                {/* 🔥 Channel Role Badge */}
                <RoleBadge
                    role={channelRole === "admin" ? "ChannelAdmin" : "Member"}
                />
                </div>

                <div className="flex gap-3">

                {channelRole !== "admin" && (
                    <button
                    onClick={() => promoteUser(u._id)}
                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                    Promote
                    </button>
                )}

                {!isSelf && (
                    <button
                    onClick={() => removeUser(u._id)}
                    className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                    Remove
                    </button>
                )}

                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
}
