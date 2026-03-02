import { useState } from "react";
import { forgotPassword } from "../../api/auth.api";
import getErrorMessage from "../../utils/getErrorMessage";
import { AnimatePresence, motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    setFormError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      setSuccess(res.message);
    } catch (err) {
      setFormError(getErrorMessage(err));
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
        <h2 className="text-lg font-semibold text-center">
          Forgot Password
        </h2>

        <AnimatePresence>
          {formError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm"
            >
              {formError}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-green-600 text-sm"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-2 rounded-3xl transition-all duration-200
           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-3xl disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}