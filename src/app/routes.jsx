import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";
import Channel from "../pages/Channel";
import Tasks from "../pages/Tasks";
import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Admin from "../pages/Admin";
import AppLayout from "../layout/AppLayout";
import SearchPage from "../pages/Search";
import ProjectPage from "../pages/Project";
import LibraryPage from "../pages/Library";
import HelpPage from "../pages/HelpPage";
import NotesPage from "../pages/Notes";
import AddNote from "../pages/notes/AddNote";
import ViewNote from "../pages/notes/ViewNote";
import ProjectsList from "../pages/ProjectsList";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminUsers from "../components/admin/AdminUsers";
import AdminChannels from "../components/admin/AdminChannels";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminActivity from "../components/admin/AdminActivity";
import ChannelSettings from "../pages/channel/ChannelSettings";
import AdminChannelView from "../pages/admin/AdminChannelView";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

/* -----------------------------
   AUTH GUARDS
----------------------------- */

// 🔐 Private routes
function RequireAuth() {
  const { user, authReady } = useAuthContext();

  if (!authReady) return null; // wait for auth restore
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

// 🚫 Public-only routes (login/register)
function PublicOnly() {
  const { user, authReady } = useAuthContext();

  if (!authReady) return null;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}

// 🛡 Role-based guard
function RequireRole({ roles }) {
  const { user, authReady } = useAuthContext();

  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}

/* -----------------------------
   ROUTES
----------------------------- */

export default function AppRoutes() {

  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public-only */}
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected app */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="channel/:id" element={<Channel />} />
            <Route path="channel/:id/settings" element={<ChannelSettings />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/new" element={<AddNote />} />
            <Route path="/notes/:id" element={<ViewNote />} />
            {/* Admin only */}
            <Route element={<RequireRole roles={["Admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/channels" element={<AdminChannels />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/activity" element={<AdminActivity />} />
              <Route
                path="/admin/channels/:id"
                element={
                  <RequireRole roles={["Admin"]}>
                    <AdminChannelView />
                  </RequireRole>
                }
              />
            </Route>
            
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
