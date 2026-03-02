import { useState } from "react";
import api from "../api/axios";
import { useUI } from "../context/UIContext";
import { useAuthContext } from "../context/AuthContext";
import { FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";
import RoleBadge from "../components/common/RoleBadge";
import { motion } from "framer-motion";

export default function Settings() {
  const { theme, setTheme, notificationsEnabled, setNotificationsEnabled } = useUI();
  const { user, setUser } = useAuthContext();

  const [name, setName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /* ================= PROFILE SAVE ================= */
  const saveProfile = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await api.put("/users/me", formData);
    setUser(res.data);
    toast.success("Profile updated successfully 🎉");
  };

  /* ================= PASSWORD CHANGE ================= */
  const changePassword = async () => {
    if (!currentPassword || !newPassword) return;

    await api.put("/users/change-password", {
      currentPassword,
      newPassword,
    });

    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password changed successfully 🔐");
  };

  /* ================= DELETE ACCOUNT ================= */
  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (!confirmDelete) return;

    await api.delete("/users/me");

    toast.success("Account deleted");
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }, 1500);
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ================= PERMISSION MATRIX ================= */
  const permissions = [
    { name: "Create Channel", admin: true, mod: false, member: false },
    { name: "Delete Channel", admin: true, mod: false, member: false },
    { name: "Convert Message → Task", admin: true, mod: true, member: false },
    { name: "Create Task", admin: true, mod: true, member: false },
    { name: "Delete Any Task", admin: true, mod: false, member: false },
    { name: "Delete Own Task", admin: true, mod: true, member: false },
    { name: "View Activity Feed", admin: true, mod: true, member: true },
  ];

  const highlight = (roleColumn) =>
    user?.role === roleColumn
      ? "bg-blue-50 dark:bg-blue-900/30 font-semibold"
      : "";

  return (
    <motion.div className="p-6 space-y-8 bg-white dark:bg-gray-800 min-h-screen text-gray-800 dark:text-gray-100"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}>

      <h2 className="text-2xl font-semibold">Settings</h2>

      {/* ================= PROFILE ================= */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">

        <h3 className="text-lg font-semibold">Profile</h3>

        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-6">
            <img
              src={
                avatarPreview ||
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}`
              }
              className="w-24 h-24 rounded-full object-cover"
            />

            <div>
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiChevronDown
              size={22}
              className={`transition-transform ${
                isEditing ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {isEditing && (
          <div className="space-y-6">

            <div>
              <input
                type="file"
                onChange={(e) => handleAvatarChange(e.target.files[0])}
              />
            </div>

            <div>
              <input
                className="p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                onClick={saveProfile}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
              >
                Save
              </button>
            </div>

            <div>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="p-2 border rounded"
              />
              <br />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 border rounded mt-2"
              />
              <br />
              <button
                onClick={changePassword}
                className="bg-yellow-500 text-white px-4 py-2 rounded mt-2"
              >
                Update Password
              </button>
            </div>

            <div>
              <button
                onClick={deleteAccount}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete Account
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ================= NOTIFICATIONS ================= */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Notifications</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
          Enable notifications
        </label>
      </div>

      {/* ================= THEME ================= */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Appearance</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
          Dark Mode
        </label>
      </div>

    </motion.div>
  );
}
