import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";
import { useUI } from "../../context/UIContext";

export default function SharedHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeChannel } = useUI();

  let title = "Home";

  if (location.pathname.startsWith("/channel")) {
    title =  `My Chatroom / ${activeChannel}`
  } else if (location.pathname !== "/") {
    title = location.pathname.slice(1);
  }

  return (
    <div className="border-b bg-white px-4 py-2 flex items-center gap-3 h-24">
      <IoArrowBackOutline onClick={() => navigate(-1)} />
      <IoArrowForwardOutline onClick={() => navigate(1)} />
      <p className="text-sm text-gray-500 capitalize">{title}</p>
    </div>
  );
}
