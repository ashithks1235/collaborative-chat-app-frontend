import TextMessage from "./TextMessage";
import FileMessage from "./FileMessage";
import getFileUrl from "../../../utils/getFileUrl";

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

  const normalizedMessage = {
    ...m,
    attachments: m.attachments?.map((file) => ({
      ...file,
      url: getFileUrl(file.url)
    }))
  };

  if (isFileOnly) {
    return (
      <FileMessage
        m={normalizedMessage}
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
      m={normalizedMessage}
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