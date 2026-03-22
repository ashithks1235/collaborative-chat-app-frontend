import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useUI } from "../context/UIContext";
import { useAuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import RoleBadge from "../components/common/RoleBadge";
import { FiArrowLeft, FiChevronDown } from "react-icons/fi";
import getFileUrl from "../utils/getFileUrl";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, notificationsEnabled, setNotificationsEnabled } = useUI();
  const { user, setUser } = useAuthContext();

  const [name, setName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteFlowStarted, setDeleteFlowStarted] = useState(false);
  const [deleteOtpVerified, setDeleteOtpVerified] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteStatusMessage, setDeleteStatusMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  const sectionCardClass =
    "bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6 transition hover:shadow-lg";
  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white";
  const fileInputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 transition file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:file:bg-blue-900/30 dark:file:text-blue-200";
  const toggleClass = "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors";

  const saveProfile = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await api.put("/users/me", formData);
      setUser(res);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      if (!currentPassword || !newPassword) {
        toast.error("Fill all password fields");
        return;
      }

      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  const requestDeleteOtp = async () => {
    try {
      setDeleteLoading(true);
      await api.post("/users/request-delete");
      setDeleteFlowStarted(true);
      setDeleteOtpVerified(false);
      setShowDeleteConfirmModal(false);
      setDeleteOtp("");
      setDeleteStatusMessage("OTP sent to your email. Enter it below to continue.");
      toast.success("OTP sent to your email");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send deletion OTP";
      setDeleteStatusMessage(message);
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const verifyDeleteOtp = async () => {
    if (!deleteOtp.trim()) {
      toast.error("Enter the OTP sent to your email");
      return;
    }

    try {
      setDeleteLoading(true);
      await api.post("/users/verify-delete-otp", { otp: deleteOtp.trim() });
      setDeleteOtpVerified(true);
      setShowDeleteConfirmModal(true);
      setDeleteStatusMessage("OTP verified. Please confirm permanent account deletion.");
      toast.success("OTP verified");
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await api.post("/users/confirm-delete");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "Account deletion failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAvatarChange = (file) => {
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleSection = (section) => {
    setActiveSection((current) => (current === section ? "" : section));
  };

  const profileImage =
    avatarPreview ||
    getFileUrl(user?.avatar) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-blue-600 dark:text-gray-300"
          >
            <FiArrowLeft />
            Back
          </button>
        </div>

        <div className={sectionCardClass}>
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Manage your profile, security, app preferences, and account controls.
              </p>
            </div>
            <button
              onClick={() => toggleSection("profile")}
              className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiChevronDown
                size={22}
                className={`transition-transform duration-300 ${
                  activeSection === "profile" ? "rotate-180 text-blue-500" : "text-gray-500"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <img
              src={profileImage}
              alt={user?.name || "User avatar"}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-50 dark:ring-blue-900/40"
            />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name || "Unknown user"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || "No email available"}
              </p>
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your name and avatar.
              </p>
            </div>
            <button
              onClick={() => toggleSection("profile")}
              className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiChevronDown
                size={22}
                className={`transition-transform duration-300 ${
                  activeSection === "profile" ? "rotate-180 text-blue-500" : "text-gray-500"
                }`}
              />
            </button>
          </div>

          {activeSection === "profile" && (
            <div className="space-y-6 pt-2">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                    className={fileInputClass}
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="rounded-2xl bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={sectionCardClass}>
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Keep your account protected with a strong password.
              </p>
            </div>
            <button
              onClick={() => toggleSection("security")}
              className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiChevronDown
                size={22}
                className={`transition-transform duration-300 ${
                  activeSection === "security" ? "rotate-180 text-blue-500" : "text-gray-500"
                }`}
              />
            </button>
          </div>

          {activeSection === "security" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                changePassword();
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-yellow-500 px-4 py-2 text-white transition hover:bg-yellow-600"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        <div className={sectionCardClass}>
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preferences
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how the app behaves for you.
              </p>
            </div>
            <button
              onClick={() => toggleSection("preferences")}
              className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiChevronDown
                size={22}
                className={`transition-transform duration-300 ${
                  activeSection === "preferences" ? "rotate-180 text-blue-500" : "text-gray-500"
                }`}
              />
            </button>
          </div>

          {activeSection === "preferences" && (
            <div className="space-y-4 pt-2">
              <div className="flex min-h-[76px] items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-4 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive activity alerts
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`${toggleClass} ${
                    notificationsEnabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label="Toggle notifications"
                >
                  <span
                    className={`absolute left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex min-h-[76px] items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-4 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle application theme
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`${toggleClass} ${
                    theme === "dark" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label="Toggle theme"
                >
                  <span
                    className={`absolute left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow transition hover:shadow-lg dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
              <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                Deleting your account is permanent.
              </p>
            </div>
            <button
              onClick={() => toggleSection("danger")}
              className="rounded-full p-2 transition hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <FiChevronDown
                size={22}
                className={`transition-transform duration-300 ${
                  activeSection === "danger" ? "rotate-180 text-red-500" : "text-red-400"
                }`}
              />
            </button>
          </div>

          {activeSection === "danger" && (
            <div className="space-y-4 pt-6">
              <p className="text-sm text-red-500 dark:text-red-300">
                Start the deletion flow to receive a one-time password in your email.
              </p>
              <button
                onClick={requestDeleteOtp}
                disabled={deleteLoading}
                className="rounded-2xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading && !deleteFlowStarted ? "Sending OTP..." : "Delete Account"}
              </button>

              {deleteFlowStarted && (
                <div className="space-y-4 rounded-xl border border-red-200 bg-white/70 p-4 dark:border-red-900/40 dark:bg-gray-900/40">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Confirm deletion with OTP
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {deleteStatusMessage || "Enter the OTP you received to continue."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                      OTP
                    </label>
                    <input
                      value={deleteOtp}
                      onChange={(e) => setDeleteOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={verifyDeleteOtp}
                      disabled={deleteLoading}
                      className="rounded-2xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteLoading ? "Verifying..." : "Confirm OTP"}
                    </button>

                    <button
                      type="button"
                      onClick={requestDeleteOtp}
                      disabled={deleteLoading}
                      className="rounded-2xl border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Account Permanently
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action is irreversible. Your account will be removed and you will lose access immediately.
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
                You will not be able to recover this account after deletion.
              </div>

              <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                disabled={deleteLoading || !deleteOtpVerified}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
