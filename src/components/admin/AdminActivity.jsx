import useFetch from "../../hooks/useFetch";
import api from "../../api/axios";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";

export default function AdminActivity() {
  const { data, loading, error } =
    useFetch(() => api.get("/admin/activity").then(res => res.data), []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">System Activity</h2>

      <div className="bg-white shadow rounded-xl p-4 space-y-3">
        {data.map(a => (
          <div key={a._id} className="border-b pb-2 text-sm">
            <strong>{a.user?.name}</strong> — {a.type}
          </div>
        ))}
      </div>
    </div>
  );
}
