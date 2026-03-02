import { useEffect, useState } from "react";
import { getNoteById, updateNote, deleteNote } from "../../api/note.api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiSave } from "react-icons/fi";

export default function ViewNote() {
  const { id } = useParams();
  const nav = useNavigate();

  const [note, setNote] = useState(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    getNoteById(id).then((n) => {
      setNote(n);
      setText(n.content);
    });
  }, [id]);

  const save = async () => {
    const updated = await updateNote(id, { content: text });
    setNote(updated);
    setEditing(false);
    toast.success("Note updated");
  };

  const remove = async () => {
    await deleteNote(id);
    toast.success("Note deleted");
    nav("/");
  };

  if (!note) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 relative">

    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 transition-colors space-y-6">

      <button
        onClick={() => nav(-1)}
        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
      >
        ← Back
      </button>

      {!editing ? (
        <div className="min-h-[400px] p-4 rounded-lg bg-white dark:bg-gray-900 
                        text-gray-800 dark:text-gray-100 whitespace-pre-line">
          {note.content}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-[500px] p-4 rounded-lg
                     bg-white dark:bg-gray-900 
                     text-gray-800 dark:text-gray-100 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

    </div>

    {/* ================= ACTION BUTTONS ================= */}
    {!editing ? (
      <div className="absolute bottom-7 right-7 flex gap-4">

        {/* EDIT */}
        <button
          onClick={() => setEditing(true)}
          className="bg-yellow-500 hover:bg-yellow-600 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110"
        >
          <FiEdit size={20} />
        </button>

        {/* DELETE */}
        <button
          onClick={remove}
          className="bg-red-500 hover:bg-red-600 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110"
        >
          <FiTrash2 size={20} />
        </button>

      </div>
    ) : (
      <div className="absolute bottom-7 right-7 flex gap-4">

        {/* SAVE */}
        <button
          onClick={save}
          className="bg-blue-500 hover:bg-blue-600 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110"
        >
          <FiSave size={20} />
        </button>

        {/* CANCEL */}
        <button
          onClick={() => setEditing(false)}
          className="bg-gray-400 hover:bg-gray-500 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110"
        >
          ✕
        </button>

      </div>
    )}

  </div>
  );
}
