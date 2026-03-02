import { useState } from "react";
import { loginUser } from "../../api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import getErrorMessage from "../../utils/getErrorMessage";
import { motion, AnimatePresence } from "framer-motion";

import { MdEmail } from "react-icons/md";
import { FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });

  const validate = () => {
    const errors = {};

    if (!userDetails.email.trim()) {
      errors.email = "Email is required";
    }

    if (!userDetails.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});
    setLoading(true);

    try {
      const data = await loginUser(userDetails);
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setFormErrors({ general: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}>
      <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white p-6 rounded-3xl shadow w-80 space-y-4"
      >
        <div className="flex justify-center">
          <FaUser className="text-5xl text-gray-600" />
        </div>

        <h2 className="text-xl font-semibold text-center">Login</h2>

        <AnimatePresence>
          {formErrors.general && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm text-center"
            >
              {formErrors.general}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded-3xl pl-10 transition-all duration-200
           focus:ring-2 focus:ring-blue-400
           focus:border-blue-400 outline-none"
            value={userDetails.email}
            onChange={(e) =>
              setUserDetails({ ...userDetails, email: e.target.value })
            }
          />
          <MdEmail className="absolute left-3 top-3 text-gray-400" />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={viewPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-2 rounded-3xl pl-10 pr-10 transition-all duration-200
           focus:ring-2 focus:ring-blue-400
           focus:border-blue-400 outline-none"
            value={userDetails.password}
            onChange={(e) =>
              setUserDetails({ ...userDetails, password: e.target.value })
            }
          />
          <FaLock className="absolute left-3 top-3 text-gray-400" />

          {viewPassword ? (
            <FaEyeSlash
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setViewPassword(false)}
            />
          ) : (
            <FaEye
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setViewPassword(true)}
            />
          )}

          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.password}
            </p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-3xl disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <p className="text-center text-sm">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </motion.form>
    </motion.div>
  );
}