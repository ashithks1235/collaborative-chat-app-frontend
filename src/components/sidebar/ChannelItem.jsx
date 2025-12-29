import { useNavigate } from "react-router-dom";

export default function ChannelItem({ channel }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/channel/${channel.id}`)}
      className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-sm"
    >
      # {channel.name}
    </div>
  );
}
