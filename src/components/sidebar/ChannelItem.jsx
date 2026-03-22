import { useNavigate } from "react-router-dom";
import { useChannelContext } from "../../context/ChannelContext";

export default function ChannelItem({ channel }) {
  const navigate = useNavigate();
  const { unreadCounts, clearUnreadCount } = useChannelContext();
  const unreadCount = unreadCounts?.[channel._id] || 0;

  const open = () => {
    clearUnreadCount(channel._id);
    navigate(`/channel/${channel._id}`);
  };

  return (
    <div
      onClick={open}
      className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <span className="truncate"># {channel.name}</span>
      {unreadCount > 0 && (
        <span className="ml-3 inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-[11px] font-semibold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
