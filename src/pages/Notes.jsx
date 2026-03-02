import { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getNotes } from "../api/note.api";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getNotes().then(setNotes);
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-6">
        
        <div className="flex items-center gap-3">
          <FiArrowLeft
            onClick={() => nav("/")}
            className="cursor-pointer text-xl text-gray-600 dark:text-gray-300"
          />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            All Notes
          </h2>
        </div>

        <button
          onClick={() => nav("/notes/new")}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
        >
          <FiPlus />
          Add Note
        </button>
      </div>

      {/* ================= NOTES LIST ================= */}
      <div className="grid gap-4">

        {notes.length === 0 && (
          <p className="text-gray-400 text-sm">
            No notes yet. Start writing something ✍️
          </p>
        )}

        {notes.map((n) => (
          <div
            key={n._id}
            onClick={() => nav(`/notes/${n._id}`)}
            className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700"
          >
            <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3 mb-2">
              {n.content}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}
