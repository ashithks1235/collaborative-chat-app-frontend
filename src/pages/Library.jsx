import { useEffect, useState } from "react";
import api from "../api/axios";
import { FiX, FiDownload, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";

const tabs = ["Photos", "Videos", "Documents"];

const formatSize = (bytes) => {
  if (!bytes) return "";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

const getIcon = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase();

  if (["pdf"].includes(ext)) return "📕";
  if (["doc", "docx"].includes(ext)) return "📘";
  if (["xls", "xlsx"].includes(ext)) return "📗";
  if (["zip", "rar"].includes(ext)) return "🗜";
  if (["ppt", "pptx"].includes(ext)) return "📙";

  return "📄";
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("Photos");
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    api.get("/library").then((res) => setFiles(res.data));
  }, []);

  const filtered = files.filter((f) => {
    if (activeTab === "Photos") return f.type === "image";
    if (activeTab === "Videos") return f.type === "video";
    if (activeTab === "Documents") return f.type === "document";
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "name")
      return (a.name || "").localeCompare(b.name || "");
  });

  /* ================= DOWNLOAD FILE ================= */

  const downloadFile = async (file) => {
    const url = `http://localhost:3000${file.url}`;

    const res = await fetch(url);
    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  /* ================= DELETE FILE ================= */

  const deleteFile = async (id) => {
    await api.delete(`/library/${id}`);
    setFiles((prev) => prev.filter((f) => f._id !== id));
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Library</h2>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-full ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FILE GRID */}
      <div className="grid grid-cols-3 gap-6">
        {sorted.map((file) => {
          const fileUrl = `http://localhost:3000${file.url}`;

          return (
            <div
              key={file._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 space-y-3"
            >
              {/* PREVIEW */}
              <div
                className="cursor-pointer"
                onClick={() => setPreview(file)}
              >
                {file.type === "image" && (
                  <img
                    src={fileUrl}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}

                {file.type === "video" && (
                  <video
                    src={fileUrl}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}

                {file.type === "document" && (
                  <div className="h-40 flex items-center justify-center text-5xl">
                    {getIcon(file.name)}
                  </div>
                )}
              </div>

              {/* FILE INFO */}
              <div>
                <p className="font-medium text-sm truncate">
                  {file.name}
                </p>

                <p className="text-xs text-gray-500">
                  {formatSize(file.size)}
                </p>
              </div>

              {/* UPLOADER */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <img
                  src={
                    file.uploadedBy?.avatar ||
                    `https://ui-avatars.com/api/?name=${file.uploadedBy?.name}`
                  }
                  className="w-6 h-6 rounded-full"
                />

                <span>{file.uploadedBy?.name}</span>
              </div>

              {/* CHANNEL */}
              {file.channel?.name && (
                <p className="text-xs text-gray-400">
                  in #{file.channel.name}
                </p>
              )}

              {/* ACTIONS */}
              <div className="flex justify-between pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <FiDownload />
                  Download
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file._id);
                  }}
                  className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700"
                >
                  <FiTrash2 />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 max-w-4xl w-full relative">
            <FiX
              onClick={() => setPreview(null)}
              className="absolute right-4 top-4 cursor-pointer"
            />

            <h3 className="font-semibold mb-3">{preview.name}</h3>

            {preview.type === "image" && (
              <img
                src={`http://localhost:3000${preview.url}`}
                className="max-h-[70vh] mx-auto"
              />
            )}

            {preview.type === "video" && (
              <video
                controls
                src={`http://localhost:3000${preview.url}`}
                className="max-h-[70vh] mx-auto"
              />
            )}

            {preview.type === "document" && (
              <iframe
                src={`http://localhost:3000${preview.url}`}
                className="w-full h-[70vh]"
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}