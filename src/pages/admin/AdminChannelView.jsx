import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import MessageList from "../../components/chat/MessageList";
import Loader from "../../components/ui/Loader";
import ErrorBox from "../../components/ui/ErrorBox";
import { FiArrowLeft } from "react-icons/fi";

export default function AdminChannelView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/channels/${id}`)
      .then(res => setChannel(res.data))
      .catch(() => setError("Failed to load channel"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b dark:border-gray-700">
        <FiArrowLeft
          className="cursor-pointer"
          onClick={() => navigate("/admin/channels")}
        />
        <h2 className="text-xl font-bold">
          #{channel.name}
        </h2>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
          Observer Mode
        </span>
      </div>

      {/* Messages Only */}
      <MessageList channelId={id} readOnly />

      {/* 🚫 No ChatInput rendered */}
    </div>
  );
}
