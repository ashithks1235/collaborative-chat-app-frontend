import TextMessage from "./TextMessage";
import FileMessage from "./FileMessage";

export default function MessageRenderer({
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
  onReply,
  onJumpToMessage
}) {

  const isFileOnly =
    (!m.text || !m.text.trim()) &&
    m.attachments &&
    m.attachments.length > 0;

  if (isFileOnly) {
    return (
      <FileMessage
        m={m}
        isSender={isSender}
        readOnly={readOnly}
        onReact={onReact}
        onDelete={onDelete}
        onReply={onReply}
      />
    );
  }

  return (
    <TextMessage
      m={m}
      isSender={isSender}
      isChannelAdmin={isChannelAdmin}
      canConvert={canConvert}
      readOnly={readOnly}
      activeHighlight={activeHighlight}
      highlightMentions={highlightMentions}
      recentlyConvertedId={recentlyConvertedId}
      onReact={onReact}
      onConvert={onConvert}
      onPin={onPin}
      onDelete={onDelete}
      onEdit={onEdit}
      onOpenThread={onOpenThread}
      onJumpToMessage={onJumpToMessage}
    />
  );
}