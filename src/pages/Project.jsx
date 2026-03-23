import { lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProjectHeader from "../components/projects/ProjectHeader";
import api from "../api/axios";
import { motion } from "framer-motion";

const KanbanBoard = lazy(() => import("../components/kanban/KanbanBoard"));

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

function ProjectPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="animate-pulse border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 h-7 w-64 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-48 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-4 h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectBoardSkeleton() {
  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-hidden p-6 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-4 h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-3">
            <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
        const payload = res?.data ?? res;
        setProject(payload?.data || payload?.project || payload || null);
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
  if (loading) return <ProjectPageSkeleton />;
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
        <Suspense fallback={<ProjectBoardSkeleton />}>
          <KanbanBoard
            projectId={project._id}
            search={search}
            groupBy={groupBy}
          />
        </Suspense>
      </div>

    </motion.div>
  );
}
