import channels from "../../mock/channels";
import ChannelItem from "./ChannelItem";
import { FaCirclePlus } from "react-icons/fa6";

export default function ChannelList() {
  return (
    <div className="mt-4 px-3">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2">
        <span>My Chatroom</span>
        <FaCirclePlus className="cursor-pointer" />
      </div>
        
      {channels.map((ch) => (
        <ChannelItem key={ch.id} channel={ch} />
      ))}
    </div>
  );
}
