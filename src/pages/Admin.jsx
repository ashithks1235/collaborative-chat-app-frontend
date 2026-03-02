import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <motion.div className="p-6 bg-gray-50 h-full"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}>
      <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex justify-between bg-white p-3 rounded shadow"
          >
            <span>{u.name}</span>
            <span className="text-sm text-gray-500">{u.role}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
