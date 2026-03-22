import { motion } from "framer-motion";
import TextHoverBar from "./TextHoverBar";
import ReplyPreview from "./ReplyPreview";

export default function TextMessage({
  m,
  isSender,
  isChannelAdmin,
  canConvert,
  readOnly,
  activeHighlight,
  highlightMentions,
  recentlyConvertedId,
  onReact,
  onConvert,
  onPin,
  onDelete,
  onEdit,
  onOpenThread,
  onJumpToMessage
}) {

const senderObj =
  typeof m.sender === "object" ? m.sender : null;

  const isRecentlyConverted = recentlyConvertedId === m._id;

  return (
    <div className="relative group">
        <motion.div
        layout
        animate={
            isRecentlyConverted
            ? { boxShadow: "0 0 0 3px #86efac" }
            : { boxShadow: "0 0 0 0px transparent" }
        }
        transition={{ duration: 0.4 }}
        className={`relative px-4 py-3 rounded-2xl shadow-md max-w-[420px] w-fit break-words
        ${activeHighlight === m._id ? "ring-2 ring-yellow-400 animate-pulse" : ""}
        ${
            isSender
            ? "bg-blue-500 text-white rounded-br-md"
            : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-md"
        }
        ${m.optimistic ? "opacity-60" : ""}`}
        >

        <TextHoverBar
            m={m}
            isSender={isSender}
            isChannelAdmin={isChannelAdmin}
            canConvert={canConvert}
            readOnly={readOnly}
            onReact={onReact}
            onConvert={onConvert}
            onPin={onPin}
            onDelete={onDelete}
            onEdit={onEdit}
            onOpenThread={onOpenThread}
        />

        {!isSender && (
            <div className="mb-1 font-semibold text-sm">
            {senderObj?.name || "User"}
            </div>
        )}

        {m.replyTo && (
            <ReplyPreview 
            reply={m.replyTo}
            onJump={onJumpToMessage} />
        )}

        {m.text && (
            <p className="text-sm whitespace-pre-wrap">
            {highlightMentions(m.text)}
            </p>
        )}
        </motion.div>
    </div>
  );
}