import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuthContext } from "../../context/AuthContext";
import RoleBadge from "../../components/common/RoleBadge";
import getFileUrl from "../../utils/getFileUrl";
import toast from "react-hot-toast";
import { FiChevronDown, FiArrowLeft } from "react-icons/fi";

export default function ChannelSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [channel, setChannel] = useState(null);
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /* ================= LOAD CHANNEL ================= */
  useEffect(() => {
    const loadChannel = async () => {
      try {
        const res = await api.get(`/channels/${id}`);
        const payload = res.data || res;
        const safeMembers = Array.isArray(payload.members)
          ? payload.members.filter((member) => member?.user?._id)
          : [];

        setChannel({ ...payload, members: safeMembers });
        setNewName(payload.name || "");
      } catch {
        toast.error("Failed to load channel");
      }
    };

    loadChannel();
  }, [id]);

  if (!channel) return null;

  /* ================= CHECK CHANNEL ADMIN ================= */
  const safeMembers = Array.isArray(channel.members)
    ? channel.members.filter((member) => member?.user?._id)
    : [];

  const isChannelAdmin = safeMembers.some(
    (m) =>
      m.user?._id === user?._id &&
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
                <div className="space-y-6 pt-6">

                    {/* Rename */}
                    <div className="space-y-2">
                    <label className="text-sm text-gray-500">
                        Channel Name
                    </label>

                    <div className="flex gap-3">
                        <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 p-2 border rounded-xl 
                                    dark:bg-gray-700
                                    focus:ring-2 focus:ring-blue-400
                                    transition"
                        />

                        <button
                        onClick={handleRename}
                        disabled={!newName || newName === channel.name}
                        className="bg-blue-500 text-white px-4 py-2 rounded-2xl
                                    hover:bg-blue-600
                                    disabled:opacity-50
                                    transition"
                        >
                        Save
                        </button>
                    </div>
                    </div>

                  
                    <div className="pt-4">

                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-2xl
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6 transition hover:shadow-lg">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              Members
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage channel roles and remove members when needed.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-200">
            {safeMembers.length} members
          </span>
        </div>

        {safeMembers.map((memberObj) => {
            const u = memberObj.user;
            const channelRole = memberObj.role;
            const isSelf = u?._id === user?._id;

            return (
            <div
                key={u._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-4 transition-colors dark:border-gray-700"
            >
                <div className="flex items-center gap-4">
                <img
                  src={
                    getFileUrl(u.avatar) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}`
                  }
                  alt={u.name || "Member"}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-50 dark:ring-blue-900/40"
                />
                <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">
                    {u.name}
                    {isSelf && " (You)"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {u.email || "No email available"}
                </p>

                {/* Channel Role Badge */}
                <RoleBadge
                    role={channelRole === "admin" ? "ChannelAdmin" : "Member"}
                />
                </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3">

                {channelRole !== "admin" && (
                    <button
                    onClick={() => promoteUser(u._id)}
                    className="rounded-2xl bg-yellow-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-yellow-600"
                    >
                    Promote
                    </button>
                )}

                {!isSelf && (
                    <button
                    onClick={() => removeUser(u._id)}
                    className="rounded-2xl bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-600"
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
