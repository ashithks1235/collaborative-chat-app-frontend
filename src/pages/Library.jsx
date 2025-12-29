import { FiBookmark, FiFileText, FiStar } from "react-icons/fi";
import Card from "../components/common/Card";
import ListItem from "../components/common/ListItem";

export default function Library() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 h-full">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold">Knowledge Library</h2>
        <p className="text-gray-500 text-sm">
          Access pinned messages, shared files, and saved resources.
        </p>
      </div>

      {/* Library Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Pinned Messages" icon={<FiBookmark />}>
          <ListItem title="Release deadline is Friday" meta="#design" />
          <ListItem title="Code freeze tomorrow" meta="#dev" />
        </Card>

        <Card title="Shared Documents" icon={<FiFileText />}>
          <ListItem title="Project.docx" meta="3 days ago" />
          <ListItem title="Sprint_Plan.xlsx" meta="Last week" />
        </Card>

        <Card title="Saved Items" icon={<FiStar />}>
          <ListItem title="MongoDB Schema Notes" meta="Saved by you" />
          <ListItem title="Socket.IO Guide" meta="Saved by John" />
        </Card>
      </div>
    </div>
  );
}
