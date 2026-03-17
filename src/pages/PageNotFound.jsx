import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";

export default function PageNotFound() {

  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-xl p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl"
      >

        <h1 className="text-7xl font-bold text-blue-600">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Page Not Found
        </h2>

        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex justify-center gap-4 mt-6">

          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            <FiHome size={16} />
            Go to Dashboard
          </button>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <FiArrowLeft size={16} />
            Go Back
          </button>

        </div>

      </motion.div>

    </div>
  );
}