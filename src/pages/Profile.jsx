import { useAuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuthContext();

  return (
    <div className="p-6 bg-gray-50 h-full">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>

      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
