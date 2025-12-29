import {
  FiMessageSquare,
  FiUsers,
  FiPlus,
  FiClipboard,
  FiActivity,
  FiBookmark,
} from "react-icons/fi";

import ActionButton from "../components/common/ActionButton";
import Card from "../components/common/Card";
import ListItem from "../components/common/ListItem";
import TaskItem from "../components/common/TaskItem";
import ActivityItem from "../components/common/ActivityItem";
import Stat from "../components/common/Stat";

export default function Home() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 h-full">

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Card */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Welcome back 👋</h2>
          <p className="text-gray-500 mt-1">
            You have 3 active chats and 2 pending tasks today.
          </p>

          <div className="mt-4 flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <FiUsers /> Role: <strong>Admin</strong>
            </span>
            <span className="text-green-600">● Online</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-xl shadow flex flex-wrap gap-3">
          <ActionButton icon={<FiPlus />} label="Create Channel" />
          <ActionButton icon={<FiUsers />} label="Add Member" />
          <ActionButton icon={<FiClipboard />} label="Create Task" />
          <ActionButton icon={<FiBookmark />} label="Pinned Messages" />
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Recent Conversations" icon={<FiMessageSquare />}>
          <ListItem title="#frontend" meta="2 unread messages" />
          <ListItem title="#backend" meta="Last active 10 mins ago" />
          <ListItem title="John Doe" meta="Online" />
        </Card>

        <Card title="Active Tasks" icon={<FiClipboard />}>
          <TaskItem title="Fix login bug" status="Overdue" />
          <TaskItem title="Review API schema" status="In Progress" />
          <TaskItem title="Prepare demo" status="Pending" />
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Pinned Messages" icon={<FiBookmark />}>
          <ListItem title="API deadline is Friday" meta="#backend" />
          <ListItem title="UI freeze by tomorrow" meta="#design" />
        </Card>

        <Card title="Team Activity" icon={<FiActivity />}>
          <ActivityItem text="John pinned a message in #frontend" />
          <ActivityItem text="Sara created a task in #backend" />
          <ActivityItem text="You added a new member" />
        </Card>
      </div>

      {/* Analytics */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Productivity Overview</h3>
        <div className="grid grid-cols-3 text-center">
          <Stat label="Messages Today" value="128" />
          <Stat label="Active Users" value="6" />
          <Stat label="Tasks Completed" value="4" />
        </div>
      </div>
    </div>
  );
}
