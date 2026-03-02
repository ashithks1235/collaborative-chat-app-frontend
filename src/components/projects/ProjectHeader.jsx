import { FiSearch, FiFilter, FiBarChart2, FiSettings } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ProjectHeader({
  project,
  search,
  setSearch,
  groupBy,
  setGroupBy
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900
                  border-gray-200 dark:border-gray-700
                 px-6 py-5 space-y-4"
    >
      {/* ================= TOP ROW ================= */}
      <div className="flex items-start justify-between">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {project.name}
          </h1>

          {project.description && (
            <p className="text-sm text-gray-500 mt-1">
              {project.description}
            </p>
          )}

          {/* Channel Tag */}
          {project.channel && (
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full
                             bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              #{project.channel.name}
            </span>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        {/* <div className="flex items-center gap-3">

          <button className="flex items-center gap-2 px-3 py-2 text-sm
                             rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">
            <FiBarChart2 size={16} />
            Insights
          </button>

          <button className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">
            <FiSettings size={16} />
          </button>

        </div> */}
      </div>

      {/* ================= FILTER ROW ================= */}
      <div className="flex items-center gap-4">

        {/* SEARCH */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border
                       border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* GROUP BY */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border
                     border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800"
        >
          <option value="status">Group by Status</option>
          <option value="assignee">Group by Assignee</option>
          <option value="due">Group by Due Date</option>
        </select>

        {/* FILTER BUTTON */}
        {/* <button className="flex items-center gap-2 px-3 py-2 text-sm
                           rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">
          <FiFilter size={16} />
          Filter
        </button> */}

      </div>
    </motion.div>
  );
}