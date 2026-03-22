import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FiX, FiUserPlus } from "react-icons/fi";
import { useAuthContext } from "../../context/AuthContext";
import getFileUrl from "../../utils/getFileUrl";

export default function AddMemberModal({
  channelId,
  currentMembers = [],
  onClose,
  onSuccess
}) {
  const { user } = useAuthContext();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingUserId, setLoadingUserId] = useState(null);

  /* ===========================
     LOAD USERS
  =========================== */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res);
      } catch {
        toast.error("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  /* ===========================
     ADD MEMBER
  =========================== */
  const addMember = async (userId) => {
    try {
      setLoadingUserId(userId);

      await api.post(`/channels/${channelId}/members`, {
        userId
      });

      toast.success("Member added successfully 🎉");

      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add member"
      );
    } finally {
      setLoadingUserId(null);
    }
  };

  /* ===========================
     FILTER USERS
  =========================== */

  const memberIds = currentMembers.map((m) => String(m._id));

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase());

    const isAdmin = u.role === "Admin";
    const isSelf = String(u._id) === String(user?._id);
    const isAlreadyMember = memberIds.includes(String(u._id));

    return matchesSearch && !isAdmin && !isSelf && !isAlreadyMember;
  });

  /* ===========================
     UI
  =========================== */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >

      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >

        <FiX
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-gray-400 transition hover:text-gray-600"
        />

        <div className="mb-5 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Member
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Invite people into the channel and keep collaboration moving.
          </p>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* USER LIST */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">

          {filteredUsers.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">
              No users available
            </p>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between rounded-xl border p-3
              hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >

              {/* USER INFO */}
              <div className="flex items-center gap-3">

                <img
                  src={
                    getFileUrl(u.avatar) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}`
                  }
                  className="w-8 h-8 rounded-full object-cover"
                  alt="avatar"
                />

                <div>
                  <p className="text-sm font-medium">
                    {u.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {u.email}
                  </p>
                </div>

              </div>

              {/* ADD BUTTON */}
              <button
                disabled={loadingUserId === u._id}
                onClick={() => addMember(u._id)}
                className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium
                bg-blue-500 text-white hover:bg-blue-600
                disabled:opacity-50 transition"
              >
                <FiUserPlus size={12} />

                {loadingUserId === u._id
                  ? "Adding..."
                  : "Add"}
              </button>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
