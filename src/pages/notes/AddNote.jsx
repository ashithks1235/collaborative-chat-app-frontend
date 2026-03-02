import { useState } from "react";
import { createNote } from "../../api/note.api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiSave } from "react-icons/fi";

export default function AddNote() {
  const [text, setText] = useState("");
  const nav = useNavigate();

  const save = async () => {
    if (!text.trim()) return toast.error("Note cannot be empty");

    try {
      await createNote({ content: text });
      toast.success("Note saved successfully");
      nav("/notes"); // 🔥 redirect to all notes
    } catch (err) {
      toast.error("Failed to save note");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 transition-colors space-y-6">

        {/* Back */}
        <button
          onClick={() => nav(-1)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          New Note
        </h2>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-[500px] p-4 rounded-lg 
                    bg-white dark:bg-gray-900 
                    text-gray-800 dark:text-gray-100 
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Save Button (Moved inside card) */}
        <div className="flex justify-end">
          <button
            onClick={save}
            className="bg-blue-500 hover:bg-blue-600 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110"
          >
            <FiSave size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
