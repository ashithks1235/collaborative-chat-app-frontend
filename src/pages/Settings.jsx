import { useState } from "react";
import api from "../api/axios";
import { useUI } from "../context/UIContext";
import { useAuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import RoleBadge from "../components/common/RoleBadge";

export default function Settings() {

  const { theme, setTheme, notificationsEnabled, setNotificationsEnabled } = useUI();
  const { user, setUser } = useAuthContext();

  const [name, setName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= PROFILE UPDATE ================= */

  const saveProfile = async () => {
    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("name", name);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await api.put("/users/me", formData);

      setUser(res.data);

      toast.success("Profile updated successfully");

    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PASSWORD CHANGE ================= */

  const changePassword = async () => {
    try {

      if (!currentPassword || !newPassword) {
        toast.error("Fill all password fields");
        return;
      }

      await api.put("/users/change-password", {
        currentPassword,
        newPassword
      });

      setCurrentPassword("");
      setNewPassword("");

      toast.success("Password updated");

    } catch (err) {
        toast.error(err.response?.data?.message || "Password change failed");
      }
  };

  /* ================= DELETE ACCOUNT ================= */

  const deleteAccount = async () => {

    if (!window.confirm("Delete your account permanently?")) return;

    try {

      const deleteAccount = async () => {
        try {
          // STEP 1: request OTP
          await api.post("/users/request-delete");
          toast.success("OTP sent to your email");

          const otp = prompt("Enter OTP sent to your email:");

          if (!otp) return;

          // STEP 2: confirm delete
          await api.post("/users/confirm-delete", { otp });

          localStorage.clear();
          window.location.href = "/login";

        } catch (err) {
          toast.error(err.response?.data?.message || "Delete failed");
        }
      };

      localStorage.removeItem("token");

      window.location.href = "/login";

    } catch {

      toast.error("Account deletion failed");

    }

  };

  /* ================= AVATAR CHANGE ================= */

  const handleAvatarChange = (file) => {

    setAvatarFile(file);

    setAvatarPreview(URL.createObjectURL(file));

  };

  return (

    <motion.div
      className="p-6 space-y-8 bg-gray-50 dark:bg-gray-950 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Settings
      </h1>

      {/* ================= PROFILE ================= */}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-6">

        <h2 className="text-lg font-semibold">Profile</h2>

        <div className="flex items-center gap-6">

          <img
            src={
              avatarPreview ||
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.name}`
            }
            className="w-24 h-24 rounded-full object-cover"
          />

          <div className="space-y-1">

            <p className="font-semibold text-lg">
              {user?.name}
            </p>

            <p className="text-sm text-gray-500">
              {user?.email}
            </p>

            <RoleBadge role={user?.role} />

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="file"
            onChange={(e) => handleAvatarChange(e.target.files[0])}
            className="text-sm"
          />

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="p-2 border rounded-lg dark:bg-gray-800"
          />

        </div>

        <button
          onClick={saveProfile}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>

      {/* ================= SECURITY ================= */}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-4">

        <h2 className="text-lg font-semibold">
          Security
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            changePassword();
          }}
          className="space-y-4"
        >
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-800"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-800"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Update Password
          </button>
        </form>

      </div>

      {/* ================= PREFERENCES ================= */}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-6">

        <h2 className="text-lg font-semibold">
          Preferences
        </h2>

        {/* Notifications */}

        <div className="flex items-center justify-between">

          <div>
            <p className="font-medium">
              Notifications
            </p>

            <p className="text-sm text-gray-500">
              Receive activity alerts
            </p>

          </div>

          <button
            onClick={() =>
              setNotificationsEnabled(!notificationsEnabled)
            }
            className={`w-12 h-6 rounded-full transition
              ${notificationsEnabled ? "bg-blue-500" : "bg-gray-300"}
            `}
          />

        </div>

        {/* Theme */}

        <div className="flex items-center justify-between">

          <div>
            <p className="font-medium">
              Dark Mode
            </p>

            <p className="text-sm text-gray-500">
              Toggle application theme
            </p>
          </div>

          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className={`w-12 h-6 rounded-full transition
              ${theme === "dark" ? "bg-blue-500" : "bg-gray-300"}
            `}
          />

        </div>

      </div>

      {/* ================= DANGER ZONE ================= */}

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-2xl p-6">

        <h2 className="text-lg font-semibold text-red-600">
          Danger Zone
        </h2>

        <p className="text-sm text-red-500 mb-4">
          Deleting your account is permanent.
        </p>

        <button
          onClick={deleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete Account
        </button>

      </div>

    </motion.div>
  );
}