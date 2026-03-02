import { useNavigate } from "react-router-dom";

export default function ChannelItem({ channel }) {
  const navigate = useNavigate();

  const open = () => {
    console.log("🧪 Channel object:", channel);
    console.log("🧪 Navigating with id:", channel._id);

    navigate(`/channel/${channel._id}`);
  };

  return (
    <div
      onClick={open}
      className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-sm"
    >
      # {channel.name}
    </div>
  );
}
