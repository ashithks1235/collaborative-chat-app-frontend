export default function ReplyPreview({ reply, onJump }) {

  if (!reply) return null;

  const attachment = reply.attachments?.[0];

  return (
    <div onClick={() => onJump?.(reply._id)} className="mb-2 px-3 py-2 text-xs rounded-md bg-black/10 dark:bg-white/10 border-l-4 border-blue-400">

      <div className="font-semibold">
        {reply.sender?.name}
      </div>

      {reply.text && (
        <div className="truncate">{reply.text}</div>
      )}

      {!reply.text && attachment && (
        <div className="truncate">
          {attachment.type === "image" && "📷 Photo"}
          {attachment.type === "video" && "🎥 Video"}
          {attachment.type === "document" && `📎 ${attachment.name}`}
        </div>
      )}

    </div>
  );
}