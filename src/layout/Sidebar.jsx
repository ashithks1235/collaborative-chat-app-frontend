import { NavLink } from "react-router-dom";
import { RiHomeSmile2Fill } from "react-icons/ri";
import { FiSearch, FiSettings } from "react-icons/fi";
import { IoFileTray } from "react-icons/io5";
import { MdVideoLibrary } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import ChannelList from "../components/sidebar/ChannelList";
import { useUI } from "../context/UIContext";

export default function Sidebar() {
  const { setRightPanel } = useUI();

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      onClick={() => setRightPanel("members")}
      className="p-2 ps-4 flex items-center text-sm font-semibold hover:bg-gray-100"
    >
      {icon} <span className="ml-2">{label}</span>
    </NavLink>
  );

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="p-4 font-bold text-lg">CodeTalk</div>
      
        {navItem("/", <RiHomeSmile2Fill />, "Home")}
        {navItem("/search", <FiSearch />, "Search")}
        {navItem("/projects", <IoFileTray />, "Projects")}
        {navItem("/library", <MdVideoLibrary />, "Library")}

        <ChannelList />
      </div>

      <div className="border-t">
        {navItem("/settings", <FiSettings />, "Settings")}
        {navItem("/profile", <FaUserCircle />, "Profile")}
      </div>
    </div>
  );
}
