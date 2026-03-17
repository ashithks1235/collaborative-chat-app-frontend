import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FiX, FiUserPlus } from "react-icons/fi";
import { useAuthContext } from "../../context/AuthContext";

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
        setUsers(res.data);
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">

      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl p-6 relative">

        {/* CLOSE */}
        <FiX
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
        />

        <h2 className="text-lg font-semibold mb-4">
          Add Member
        </h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg text-sm
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
              className="flex items-center justify-between p-3 rounded-lg border
              hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >

              {/* USER INFO */}
              <div className="flex items-center gap-3">

                <img
                  src={
                    u.avatar ||
                    `https://ui-avatars.com/api/?name=${u.name}`
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs
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