import { NavLink, useNavigate } from "react-router-dom";
import {
  RiHomeSmile2Fill
} from "react-icons/ri";
import {
  FiSettings,
  FiUsers
} from "react-icons/fi";
import {
  MdVideoLibrary,
  MdVideoCall
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

  const actionButtonClass =
    "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-sm transition";
  const menuLogoutClass =
    "flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20";

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
        </div>

        <div className="space-y-3 px-4 pb-6">
          <button
            onClick={handleLogout}
            className={menuLogoutClass}
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

      <div className="space-y-3 px-4 pb-6">
        <NavLink
          to="/meeting"
          onClick={() => setShowThreadPanel(false)}
          className={({ isActive }) =>
            `${actionButtonClass}
            ${
              isActive
                ? "bg-blue-600 text-white"
                : "border border-blue-100 bg-blue-500 text-white hover:bg-blue-400"
            }`
          }
        >
          <MdVideoCall />
          <span>Video Meeting</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className={menuLogoutClass}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}
