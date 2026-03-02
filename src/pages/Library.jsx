import { useEffect, useState } from "react";
import api from "../api/axios";
import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";

const tabs = ["Photos", "Videos", "Documents", "Links"];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("Photos");
  const [files, setFiles] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState([]);
const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    api.get("/library").then(res => setFiles(res.data));
  }, []);

  const filtered = files.filter(f =>
    activeTab === "Photos" ? f.type === "image" :
    activeTab === "Videos" ? f.type === "video" :
    activeTab === "Documents" ? f.type === "document" :
    f.type === "link"
  );

  useEffect(() => {
    if (selectMode) setPreview(null);
  }, [selectMode]);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    return 0;
  });

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const bulkDelete = async () => {
    await api.post("/library/delete-many", { ids: selected });
    setFiles(prev => prev.filter(f => !selected.includes(f._id)));
    setSelected([]);
    setSelectMode(false);
  };

  const selectAllInTab = () => {
    const ids = sorted.map(f => f._id);
    setSelected(ids);
  };

  return (
    <motion.div className="p-6 space-y-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}>

      <h2 className="text-2xl font-semibold">Library</h2>

      {/* Tabs + Sort */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SORT */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded-lg text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            setSelectMode(!selectMode);
            setSelected([]);
          }}
          className="text-sm bg-gray-100 px-3 py-1 rounded"
        >
          {selectMode ? "Cancel" : "Select"}
        </button>

        {selectMode && (
          <div className="flex gap-2">
            <button
              onClick={selectAllInTab}
              className="text-sm bg-gray-200 px-3 py-1 rounded"
            >
              Select All
            </button>

            {selected.length > 0 && (
              <button
                onClick={bulkDelete}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete ({selected.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-5">
        {sorted.map(file => (
          <div
            key={file._id}
            onClick={() =>
              selectMode ? toggleSelect(file._id) : setPreview(file)
            }
            className={`relative bg-white shadow rounded-xl p-3 hover:shadow-lg transition cursor-pointer ${
              selected.includes(file._id) ? "ring-2 ring-red-500" : ""
            }`}
          >
            {/* SELECT CHECKBOX */}
            {selectMode && (
              <input
                type="checkbox"
                checked={selected.includes(file._id)}
                readOnly
                className="absolute top-2 left-2 w-4 h-4"
              />
            )}

            {file.type === "image" && (
              <img src={file.url} className="w-full h-40 object-cover rounded-lg mb-2" />
            )}

            {file.type === "video" && (
              <video src={file.url} className="w-full h-40 object-cover rounded-lg mb-2" />
            )}

            {file.type === "document" && (
              <div className="h-40 flex items-center justify-center text-4xl">📄</div>
            )}

            {file.type === "link" && (
              <div className="h-40 flex items-center justify-center text-4xl">🔗</div>
            )}

            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-400">
              {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* 🔍 MEDIA PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl max-w-4xl w-full relative">

            <FiX
              className="absolute right-4 top-4 cursor-pointer text-xl"
              onClick={() => setPreview(null)}
            />

            <h3 className="font-semibold mb-3">{preview.name}</h3>

            {preview.type === "image" && (
              <img src={preview.url} className="max-h-[70vh] mx-auto" />
            )}

            {preview.type === "video" && (
              <video controls src={preview.url} className="max-h-[70vh] mx-auto" />
            )}

            {preview.type === "document" && (
              <iframe
                src={preview.url}
                className="w-full h-[70vh]"
                title="doc-preview"
              />
            )}

            {preview.type === "link" && (
              <div className="text-center">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Open Link
                </a>
              </div>
            )}

          </div>
        </div>
      )}
    </motion.div>
  );
}
