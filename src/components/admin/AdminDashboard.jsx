import useFetch from "../../hooks/useFetch";
import { fetchAdminOverview } from "../../services/admin.service";
import Loader from "../ui/Loader";
import ErrorBox from "../ui/ErrorBox";
import Card from "../common/Card";
import Stat from "../common/Stat";

export default function AdminDashboard() {
  const { data, loading, error } = useFetch(fetchAdminOverview, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total Users" value={data.totalUsers} />
        <Stat label="Total Channels" value={data.totalChannels} />
        <Stat label="Total Tasks" value={data.totalTasks} />
        <Stat label="Total Messages" value={data.totalMessages} />
      </div>

      <Card title="Recent System Activity">
        <div className="space-y-2 text-sm">
          {data.recentActivity.map(a => (
            <div key={a._id} className="border-b pb-2">
              <strong>{a.user?.name}</strong> — {a.type}
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
