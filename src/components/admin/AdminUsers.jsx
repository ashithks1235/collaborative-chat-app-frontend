import useFetch from "../../hooks/useFetch";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";
import { useState } from "react";
import toast from "react-hot-toast";

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

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

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

  /* ===============================
     UI
  =============================== */
  return (
  <div className="p-6 space-y-6">
    <h2 className="text-2xl font-semibold">Manage Users</h2>

    <div className="bg-white shadow rounded-xl p-4 space-y-3">
      {users
        ?.filter((u) => u.role !== "Admin") // hide super admin
        .map((u) => (
          <div
            key={u._id}
            className="flex justify-between items-center border-b pb-3"
          >
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
              <div
                className={`text-xs mt-1 ${
                  u.isActive ? "text-green-500" : "text-red-500"
                }`}
              >
                {u.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={u.role}
                onChange={(e) =>
                  changeRole(u._id, e.target.value)
                }
                disabled={processing === u._id}
                className="border px-2 py-1 text-sm rounded"
              >
                <option value="Member">Member</option>
                <option value="Moderator">Moderator</option>
              </select>

              <button
                disabled={processing === u._id}
                onClick={() => toggleStatus(u)}
                className="text-yellow-600 text-sm"
              >
                {u.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                disabled={processing === u._id}
                onClick={() => removeUser(u._id)}
                className="text-red-500 text-sm"
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
