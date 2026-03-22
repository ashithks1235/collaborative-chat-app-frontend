import { Shield, User } from "lucide-react";

export default function RoleBadge({ role }) {
  const normalizedRole = String(role || "member").toLowerCase();

  if (normalizedRole === "admin") {
    return null;
  }

  const variants = {
    admin: {
      label: "Admin",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
    },
    channeladmin: {
      label: "Admin",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
    },
    moderator: {
      label: "Admin",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
    },
    member: {
      label: "Member",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    }
  };

  const variant = variants[normalizedRole] || variants.member;
  const Icon = variant.label === "Member" ? User : Shield;

  return (
    <span
      className={`inline-flex shrink-0 self-center whitespace-nowrap min-h-7 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold leading-none ${variant.className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {variant.label}
    </span>
  );
}
