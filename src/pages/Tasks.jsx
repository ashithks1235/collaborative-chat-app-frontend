import { useTaskContext } from "../context/TaskContext";
import TaskItem from "../components/common/TaskItem";

export default function Tasks() {
  const { tasks } = useTaskContext();

  return (
    <div className="p-6 bg-gray-50 h-full">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      {tasks.map((task) => (
        <TaskItem key={task._id} title={task.title} status={task.status} />
      ))}
    </div>
  );
}
