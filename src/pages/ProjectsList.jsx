import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();
  const { user } = useAuthContext();

  const canCreate =
    user?.role === "Moderator" || user?.role === "Admin";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");

        // ✅ Correct backend structure handling
        const projectData = res.data || res || [];
        setProjects(projectData);

      } catch (err) {
        console.error("Failed to load projects:", err);
        setProjects([]);
      } finally {
        // ✅ IMPORTANT FIX
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Projects</h2>
      </div>

      {projects.length === 0 && (
        <div className="text-gray-500 text-sm">
          No projects available.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {projects.map((project) => {

          // ✅ Use backend stats properly
          const totalTasks = project.stats?.totalTasks || 0;
          const completedTasks = project.stats?.completedTasks || 0;

          const completion =
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;

          return (
            <motion.div
                key={project._id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                onClick={() => nav(`/projects/${project._id}`)}
                className="
                  p-6
                  bg-white/70 dark:bg-gray-900/60
                  backdrop-blur-md
                  rounded-2xl
                  cursor-pointer
                  transition-all duration-300
                  hover:shadow-lg
                "
              >
                <div className="flex items-center justify-between">

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {project.name}
                  </h3>

                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <div>Members: {project.members?.length || 0}</div>
                  <div>Tasks: {totalTasks}</div>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {completion}% completed
                  </p>
                </div>
              </motion.div>
          );
        })}
      </div>
    </div>
  );
}