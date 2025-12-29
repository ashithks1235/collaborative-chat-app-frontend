import { FiFolder, FiClipboard, FiUsers } from "react-icons/fi";
import Card from "../components/common/Card";
import TaskItem from "../components/common/TaskItem";
import ListItem from "../components/common/ListItem";

export default function Projects() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 h-full">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold">Projects</h2>
        <p className="text-gray-500 text-sm">
          Track ongoing projects, tasks, and team assignments.
        </p>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Active Projects" icon={<FiFolder />}>
          <ListItem title="Smart Chat Platform" meta="In Progress" />
          <ListItem title="Admin Dashboard" meta="Planning" />
        </Card>

        <Card title="Project Tasks" icon={<FiClipboard />}>
          <TaskItem title="Implement authentication" status="In Progress" />
          <TaskItem title="Design database schema" status="Completed" />
          <TaskItem title="Socket integration" status="Pending" />
        </Card>
      </div>

      {/* Team Allocation */}
      <Card title="Team Allocation" icon={<FiUsers />}>
        <ListItem title="Frontend Team" meta="3 members" />
        <ListItem title="Backend Team" meta="2 members" />
        <ListItem title="QA Team" meta="1 member" />
      </Card>
    </div>
  );
}
