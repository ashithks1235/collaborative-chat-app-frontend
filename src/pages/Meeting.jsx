import { motion } from "framer-motion";

export default function Meeting() {
  return (
    <motion.div
      className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 text-center space-y-4">

        <h1 className="text-xl font-semibold">
          Video Meeting
        </h1>

        <p className="text-sm text-gray-500">
          Will introduce soon
        </p>

        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Meeting
        </button>

      </div>
    </motion.div>
  );
}