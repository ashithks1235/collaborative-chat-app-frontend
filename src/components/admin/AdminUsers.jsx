import useFetch from "../../hooks/useFetch";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";
import { useState } from "react";
import toast from "react-hot-toast";
import getFileUrl from "../../utils/getFileUrl";

import {
  getAllUsers,
  deleteUser,
  deactivateUser,
  activateUser,
  updateUserRole,
} from "../../api/user.api";

export default function AdminUsers() {
  const { data: users, loading, error, refetch } =
    useFetch(() => getAllUsers(), []);

  const [processing, setProcessing] = useState(null);
  const [search, setSearch] = useState("");

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  const filteredUsers =
    users
      ?.filter((u) => u.role !== "Admin")
      ?.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      ) || [];

  /* ===============================
     DEACTIVATE / ACTIVATE
  =============================== */
  const toggleStatus = async (user) => {
    try {
      setProcessing(user._id);

      if (user.isActive) {
        await deactivateUser(user._id);
        toast.success("User deactivated");
      } else {
        await activateUser(user._id);
        toast.success("User activated");
      }

      refetch();
    } catch {
      toast.error("Action failed");
    } finally {
      setProcessing(null);
    }
  };

  /* ===============================
     CHANGE ROLE
  =============================== */
  const changeRole = async (id, role) => {
    try {
      setProcessing(id);
      await updateUserRole(id, role);
      toast.success("Role updated");
      refetch();
    } catch {
      toast.error("Update failed");
    } finally {
      setProcessing(null);
    }
  };

  /* ===============================
     DELETE USER
  =============================== */
  const removeUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      setProcessing(id);
      await deleteUser(id);
      toast.success("User deleted");
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
          Manage Users
        </h2>

        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64 dark:bg-gray-800"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl">

        {filteredUsers.length === 0 && (
          <p className="p-6 text-sm text-gray-500">
            No users found
          </p>
        )}

        {filteredUsers.map((u) => (
          <div
            key={u._id}
            className="flex justify-between items-center px-6 py-4 drop-shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition gap-1"
          >

            {/* USER INFO */}
            <div className="flex items-center gap-4">

              <img
                src={
                  getFileUrl(u.avatar) ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}`
                }
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <div className="font-medium">
                  {u.name}
                </div>

                <div className="text-xs text-gray-500">
                  {u.email}
                </div>

                <span
                  className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full
                  ${
                    u.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {u.isActive ? "Active" : "Inactive"}
                </span>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 items-center">

              <select
                value={u.role}
                onChange={(e) =>
                  changeRole(u._id, e.target.value)
                }
                disabled={processing === u._id}
                className="bg-gray-50 px-4 py-2 text-sm rounded-2xl hover:border dark:bg-gray-800"
              >
                <option value="Member">Member</option>
                <option value="Moderator">Moderator</option>
              </select>

              <button
                disabled={processing === u._id}
                onClick={() => toggleStatus(u)}
                className="bg-yellow-500 text-sm text-white py-1 px-4 rounded-2xl hover:bg-yellow-600"
              >
                {u.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                disabled={processing === u._id}
                onClick={() => removeUser(u._id)}
                className="bg-red-500 text-sm text-white py-1 px-4 rounded-2xl hover:bg-red-600"
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
