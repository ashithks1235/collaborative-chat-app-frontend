import { FaThumbsUp } from "react-icons/fa6";
import { FaReply } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function HoverIconButton({ label, className, onClick, children }) {
  return (
    <div className="group/icon relative flex">
      <div className="pointer-events-none absolute -top-11 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center opacity-0 transition duration-150 group-hover/icon:-translate-y-1 group-hover/icon:opacity-100">
        <span className="whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-white shadow-lg ring-1 ring-black/10 dark:bg-gray-700 dark:ring-white/10">
          {label}
        </span>
        <span className="h-2 w-2 -translate-y-1 rotate-45 bg-gray-900 shadow-sm dark:bg-gray-700" />
      </div>
      <button
        onClick={onClick}
        className={className}
        aria-label={label}
        type="button"
      >
        {children}
      </button>
    </div>
  );
}

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
      className={`absolute -top-7 ${
        isSender ? "right-2" : "left-2"
      } opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200
      flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg border
      rounded-lg px-2 py-1 text-xs z-20`}
    >
      <HoverIconButton
        label="Add reaction"
        onClick={() => onReact?.(m._id, "👍")}
        className="text-yellow-500 transition hover:text-yellow-400"
      >
        <FaThumbsUp size={14}/>
      </HoverIconButton>

      <HoverIconButton
        label="Reply in thread"
        onClick={() => onReply?.(m)}
        className="text-blue-600 transition hover:text-blue-500"
      >
        <FaReply size={12}/>
      </HoverIconButton>

      {isSender && (
        <HoverIconButton
          label="Delete message"
          onClick={() => onDelete?.(m._id)}
          className="text-red-700 transition hover:text-red-600"
        >
          <MdDelete size={14}/>
        </HoverIconButton>
      )}
    </div>
  );
}
