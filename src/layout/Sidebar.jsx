import { NavLink, useNavigate } from "react-router-dom";
import {
  RiHomeSmile2Fill
} from "react-icons/ri";
import {
  FiSettings,
  FiHelpCircle,
  FiUsers,
  FiActivity
} from "react-icons/fi";
import {
  MdVideoLibrary
} from "react-icons/md";
import {
  FaProjectDiagram,
  FaSignOutAlt,
  FaChartBar
} from "react-icons/fa";

import ChannelList from "../components/sidebar/ChannelList";
import { useUI } from "../context/UIContext";
import { useAuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { setShowThreadPanel } = useUI();
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 p-2 px-4 text-sm transition ${
      isActive
        ? "bg-blue-50 text-blue-600 font-semibold border-r-4 border-blue-500"
        : "hover:bg-gray-100"
    }`;

  const nav = (to, icon, label) => (
    <NavLink
      to={to}
      className={linkStyle}
      onClick={() => setShowThreadPanel(false)}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ===============================
     ADMIN SIDEBAR
  =============================== */

  if (user?.role === "Admin") {
    return (
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="p-5 font-bold text-lg">
            CodeTalk Admin
          </div>

          {nav("/admin/dashboard", <RiHomeSmile2Fill />, "Dashboard")}
          {nav("/admin/users", <FiUsers />, "Users")}
          {nav("/admin/channels", <FaProjectDiagram />, "Channels")}
          {nav("/admin/analytics", <FaChartBar />, "Analytics")}
          {nav("/admin/activity", <FiActivity />, "System Activity")}
        </div>

        <div className="pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 px-4 text-sm w-full hover:bg-red-50 text-red-600"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    );
  }

  /* ===============================
     NORMAL USER SIDEBAR
  =============================== */

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="p-5 font-bold text-lg">CodeTalk</div>

        {nav("/", <RiHomeSmile2Fill />, "Home")}
        {nav("/library", <MdVideoLibrary />, "Library")}
        {nav("/projects", <FaProjectDiagram />, "Projects")}
        {nav("/settings", <FiSettings />, "Settings")}

        <ChannelList />
      </div>

      <div className="pb-6">
        {nav("/help", <FiHelpCircle />, "Help & Support")}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 px-4 text-sm w-full hover:bg-red-50 text-red-600"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}
