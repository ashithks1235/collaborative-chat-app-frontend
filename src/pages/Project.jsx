import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KanbanBoard from "../components/kanban/KanbanBoard";
import ProjectHeader from "../components/projects/ProjectHeader";
import api from "../api/axios";
import { motion } from "framer-motion";

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("status");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    if (!isValidObjectId(id)) {
      navigate("/", { replace: true });
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${id}`);
        setProject(res.data?.data?.project);
      } catch(err) {
        console.error(err);
        setError("Project not found");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  if (!id) return <div className="p-6">No project selected</div>;
  if (loading) return <div className="p-6 text-gray-500">Loading project...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!project) return null;

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* Premium Project Header */}
      <ProjectHeader
        project={project}
        search={search}
        setSearch={setSearch}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
      />

      {/* Workspace Area */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          projectId={project._id}
          search={search}
          groupBy={groupBy}
        />
      </div>

    </motion.div>
  );
}