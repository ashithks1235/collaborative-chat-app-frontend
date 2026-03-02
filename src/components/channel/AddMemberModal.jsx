import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
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
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

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
      setLoading(false);
    }
  };

  /* ===========================
     FILTER USERS
     - hide Admin
     - hide self
     - hide already members
     - apply search
  =========================== */
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase());

    const isAdmin = u.role === "Admin";

    // 🔥 FIXED HERE
    const isSelf =
      String(u._id) === String(user?._id);

    const isAlreadyMember =
      currentMembers.some(
        (m) => String(m._id) === String(u._id)
      );

    return matchesSearch && !isAdmin && !isSelf && !isAlreadyMember;
  });

  /* ===========================
     UI
  =========================== */
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl p-5 relative">

        {/* CLOSE */}
        <FiX
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500"
        />

        <h2 className="text-lg font-semibold mb-4">
          Add Member
        </h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg text-sm"
        />

        {/* USER LIST */}
        <div className="max-h-64 overflow-y-auto space-y-2">

          {filteredUsers.length === 0 && (
            <p className="text-xs text-gray-400 text-center">
              No users available
            </p>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between p-2 border rounded-lg text-sm"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">
                  {u.email}
                </p>
              </div>

              <button
                disabled={loading}
                onClick={() => addMember(u._id)}
                className="px-3 py-1 rounded text-xs transition bg-blue-500 text-white hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
