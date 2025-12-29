import { Routes, Route, useLocation } from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import Sidebar from "./layout/Sidebar";
import ChatLayout from "./layout/ChatLayout";
import ThreadPanel from "./layout/ThreadPanel";
import MembersPanel from "./layout/MembersPanel";
import SharedHeader from "./components/header/SharedHeader";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Projects from "./pages/Projects";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Channel from "./pages/Channel";

import { useUI } from "./context/UIContext";

export default function App() {
  const { rightPanel } = useUI();
  const location = useLocation();

  const isChannelRoute = location.pathname.startsWith("/channel");

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<SharedHeader />}
      chat={
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/channel/:id" element={<Channel />} />
        </Routes>
      }
      thread={
        isChannelRoute
          ? <ThreadPanel />
          : <MembersPanel />
      }
    />
  );
}
