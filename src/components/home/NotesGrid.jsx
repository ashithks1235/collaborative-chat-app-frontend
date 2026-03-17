import { useEffect, useState } from "react";
import { getNotes } from "../../api/note.api";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

export default function NotesGrid() {
  const [notes, setNotes] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getNotes().then(setNotes);
  }, []);

  const recent = notes.slice(0, 2);
  const hasMore = notes.length > 2;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 transition-colors">
      <h3 className="font-semibold mb-3">Notes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-52">

        {/* 📝 NEW NOTE CARD */}
        <div
          onClick={() => nav("/notes/new")}
          className="bg-white flex flex-col items-center cursor-pointer dark:bg-gray-800 transition-colors"
        >
          <p className="mt-4 text-4xl font-semibold text-gray-500">
            Write Something...
          </p>
        </div>

        {/* 🗒 RECENT NOTE 1 */}
        <div
          onClick={() => recent[0] && nav(`/notes/${recent[0]._id}`)}
          className="bg-white p-4 cursor-pointer dark:bg-gray-800 transition-colors"
        >
          {recent[0] ? (
            <p className="text-sm text-gray-600 line-clamp-6">
              {recent[0].content}
            </p>
          ) : null}
        </div>

        {/* 🗒 RECENT NOTE 2 */}
        <div
          onClick={() => recent[1] && nav(`/notes/${recent[1]._id}`)}
          className="bg-white p-4 cursor-pointer dark:bg-gray-800 transition-colors"
        >
          {recent[1] ? (
            <p className="text-sm text-gray-600 line-clamp-6">
              {recent[1].content}
            </p>
          ) : null}
        </div>

        {/* ➡ VIEW ALL ARROW (only if more than 2 notes) */}
        {hasMore && (
          <div
            onClick={() => nav("/notes")}
            className="bg-white flex items-center justify-center cursor-pointer dark:bg-gray-800 transition-colors"
          >
            <FiArrowRight size={28} className="text-gray-500" />
          </div>
        )}

      </div>
    </div>
  );
}
