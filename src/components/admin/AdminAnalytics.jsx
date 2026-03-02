import useFetch from "../../hooks/useFetch";
import api from "../../api/axios";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";

export default function AdminAnalytics() {
  const { data, loading, error } =
    useFetch(() => api.get("/analytics").then(res => res.data), []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">System Analytics</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded-xl">
          Total Tasks: {data.totalTasks}
        </div>

        <div className="bg-white shadow p-4 rounded-xl">
          Completed Tasks: {data.completedTasks}
        </div>

        <div className="bg-white shadow p-4 rounded-xl">
          Active Users: {data.activeUsers}
        </div>
      </div>
    </div>
  );
}
