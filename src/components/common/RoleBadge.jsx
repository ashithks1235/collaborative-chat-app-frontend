import { Shield, User } from "lucide-react";

export default function RoleBadge({ role }) {
  const base =
    "flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium";

  /* ===============================
     CHANNEL ADMIN
  =============================== */
  if (role === "admin") {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  }

  /* ===============================
     CHANNEL MEMBER
  =============================== */
  return (
    <span className={`${base} bg-blue-100 text-blue-600`}>
      <User className="w-3 h-3" />
      Member
    </span>
  );
}