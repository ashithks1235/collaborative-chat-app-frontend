import { FiSearch, FiMessageSquare, FiUsers, FiFileText } from "react-icons/fi";
import Card from "../components/common/Card";
import ListItem from "../components/common/ListItem";

export default function Search() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 h-full">

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
        <FiSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Search messages, channels, members..."
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Messages" icon={<FiMessageSquare />}>
          <ListItem title="Meeting at 5 PM" meta="#general" />
          <ListItem title="API deployment done" meta="#backend" />
        </Card>

        <Card title="Channels" icon={<FiUsers />}>
          <ListItem title="#frontend" meta="12 members" />
          <ListItem title="#design" meta="8 members" />
        </Card>

        <Card title="Files" icon={<FiFileText />}>
          <ListItem title="API_Specs.pdf" meta="yesterday" />
          <ListItem title="UI_Wireframe.fig" meta="2 days ago" />
        </Card>
      </div>
    </div>
  );
}
