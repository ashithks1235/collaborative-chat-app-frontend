import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import { useAuthContext } from "../../context/AuthContext";
import getErrorMessage from "../../utils/getErrorMessage";
import { AnimatePresence, motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    const errors = {};

    if (!userDetails.username.trim())
      errors.username = "Name is required";

    if (!userDetails.email.trim())
      errors.email = "Email is required";

    if (userDetails.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (userDetails.password !== userDetails.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});
    setLoading(true);

    try {
      const data = await registerUser(userDetails);
      setUser(data.user);
      navigate("/");
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
        onSubmit={handleRegister}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white p-6 rounded-3xl shadow w-80 space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Register</h2>
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

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 rounded-3xl transition-all duration-200
           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          onChange={(e) =>
            setUserDetails({ ...userDetails, username: e.target.value })
          }
        />
        <AnimatePresence mode="wait">
          {formErrors.username && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm text-center"
            >
              {formErrors.username}
            </motion.p>
          )}
        </AnimatePresence>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded-3xl transition-all duration-200
           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          onChange={(e) =>
            setUserDetails({ ...userDetails, email: e.target.value })
          }
        />
        <AnimatePresence mode="wait">
          {formErrors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm text-center"
            >
              {formErrors.email}
            </motion.p>
          )}
        </AnimatePresence>

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded-3xl transition-all duration-200
           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          onChange={(e) =>
            setUserDetails({ ...userDetails, password: e.target.value })
          }
        />
        <AnimatePresence mode="wait">
          {formErrors.password && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm text-center"
            >
              {formErrors.password}
            </motion.p>
          )}
        </AnimatePresence>

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-2 rounded-3xl transition-all duration-200
           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          onChange={(e) =>
            setUserDetails({ ...userDetails, confirmPassword: e.target.value })
          }
        />
        <AnimatePresence mode="wait">
          {formErrors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm text-center"
            >
              {formErrors.confirmPassword}
            </motion.p>
          )}
        </AnimatePresence>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-3xl disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </motion.button>

        <p className="text-center text-sm">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </motion.form>
    </motion.div>
  );
}