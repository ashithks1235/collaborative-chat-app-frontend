import { useEffect, useState } from "react";
import api from "../api/axios";

export default function useChannelProjects(channelId) {

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!channelId) return;

    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const all = Array.isArray(res.data) ? res.data : [];

        const filtered = all.filter(
          p => p.channel?._id === channelId
        );

        setProjects(filtered);
      } catch {
        console.error("Failed to load projects");
      }
    };

    fetchProjects();

  }, [channelId]);

  return projects;
}