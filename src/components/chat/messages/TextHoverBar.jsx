import { FiThumbsUp, FiEdit, FiTrash, FiCornerUpRight } from "react-icons/fi";
import { MdOutlinePushPin, MdTask } from "react-icons/md";

export default function TextHoverBar({
  m,
  isSender,
  isChannelAdmin,
  canConvert,
  readOnly,
  onReact,
  onConvert,
  onPin,
  onDelete,
  onEdit,
  onOpenThread
}) {
  if (readOnly || m.isDeleted) return null;

  return (
    <div
      className={`absolute -top-6 ${
        isSender ? "right-2" : "left-2"
      } opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200
      flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg border
      rounded-lg px-2 py-1 text-xs z-20`}
    >
      <button onClick={() => onReact?.(m._id, "👍")}>
        <FiThumbsUp size={14}/>
      </button>

      <button onClick={() => onOpenThread?.(m)}>
        <FiCornerUpRight size={14}/>
      </button>

      {isChannelAdmin && !m.pinned && (
        <button onClick={() => onPin?.(m._id)}>
          <MdOutlinePushPin size={14}/>
        </button>
      )}

      {canConvert && (
        <button onClick={() => onConvert?.(m)}>
          <MdTask size={14}/>
        </button>
      )}

      {isSender && (
        <button onClick={() => onEdit?.(m)}>
          <FiEdit size={14}/>
        </button>
      )}

      {isSender && (
        <button onClick={() => onDelete?.(m._id)}>
          <FiTrash size={14}/>
        </button>
      )}
    </div>
  );
}