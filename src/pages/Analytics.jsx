import { useEffect, useState } from "react";
import { getAnalytics } from "../api/analytics.api";
import Card from "../components/common/Card";

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAnalytics().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="p-6 bg-gray-50 h-full">
      <Card title="Analytics Overview">
        <p>Messages Today: {stats.messagesToday}</p>
        <p>Active Users: {stats.activeUsers}</p>
        <p>Top Channel: {stats.topChannel}</p>
      </Card>
    </div>
  );
}
