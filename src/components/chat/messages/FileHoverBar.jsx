import { FiThumbsUp, FiTrash, FiCornerUpRight } from "react-icons/fi";

export default function FileHoverBar({
  m,
  isSender,
  readOnly,
  onReact,
  onDelete,
  onReply
}) {
  if (readOnly || m.isDeleted) return null;

  return (
    <div
      className={`absolute -top-3 ${
        isSender ? "right-2" : "left-2"
      } opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200
      flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg border
      rounded-lg px-2 py-1 text-xs z-20`}
    >

      {/* Reaction */}
      <button
        onClick={() => onReact?.(m._id, "👍")}
        className="hover:text-yellow-600 transition"
      >
        <FiThumbsUp size={14}/>
      </button>

      {/* WhatsApp Style Reply */}
      <button
        onClick={() => onReply?.(m)}
        className="hover:text-purple-600 transition"
      >
        <FiCornerUpRight size={14}/>
      </button>

      {/* Delete */}
      {isSender && (
        <button
          onClick={() => onDelete?.(m._id)}
          className="hover:text-red-600 transition"
        >
          <FiTrash size={14}/>
        </button>
      )}
    </div>
  );
}