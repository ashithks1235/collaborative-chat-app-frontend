import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";
import Channel from "../pages/Channel";
import Tasks from "../pages/Tasks";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import AppLayout from "../layout/AppLayout";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import PageNotFound from "../pages/PageNotFound";

const Analytics = lazy(() => import("../pages/Analytics"));
const SearchPage = lazy(() => import("../pages/Search"));
const ProjectPage = lazy(() => import("../pages/Project"));
const LibraryPage = lazy(() => import("../pages/Library"));
const Meeting = lazy(() => import("../pages/Meeting"));
const NotesPage = lazy(() => import("../pages/Notes"));
const AddNote = lazy(() => import("../pages/notes/AddNote"));
const ViewNote = lazy(() => import("../pages/notes/ViewNote"));
const ProjectsList = lazy(() => import("../pages/ProjectsList"));
const ChannelSettings = lazy(() => import("../pages/channel/ChannelSettings"));
const AdminDashboard = lazy(() => import("../components/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../components/admin/AdminUsers"));
const AdminChannels = lazy(() => import("../components/admin/AdminChannels"));
const AdminAnalytics = lazy(() => import("../components/admin/AdminAnalytics"));
const AdminChannelView = lazy(() => import("../pages/admin/AdminChannelView"));

function RouteLoader() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Loading...
    </div>
  );
}

function LazyRoute({ children }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

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
      <Routes location={location}>
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
            <Route
              path="channel/:id/settings"
              element={
                <LazyRoute>
                  <ChannelSettings />
                </LazyRoute>
              }
            />
            <Route path="tasks" element={<Tasks />} />
            <Route
              path="analytics"
              element={
                <LazyRoute>
                  <Analytics />
                </LazyRoute>
              }
            />
            <Route
              path="/search"
              element={
                <LazyRoute>
                  <SearchPage />
                </LazyRoute>
              }
            />
            <Route
              path="/library"
              element={
                <LazyRoute>
                  <LibraryPage />
                </LazyRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <LazyRoute>
                  <ProjectsList />
                </LazyRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <LazyRoute>
                  <ProjectPage />
                </LazyRoute>
              }
            />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="/meeting"
              element={
                <LazyRoute>
                  <Meeting />
                </LazyRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <LazyRoute>
                  <NotesPage />
                </LazyRoute>
              }
            />
            <Route
              path="/notes/new"
              element={
                <LazyRoute>
                  <AddNote />
                </LazyRoute>
              }
            />
            <Route
              path="/notes/:id"
              element={
                <LazyRoute>
                  <ViewNote />
                </LazyRoute>
              }
            />
            {/* Admin only */}
            <Route element={<RequireRole roles={["Admin"]} />}>
              <Route
                path="/admin/dashboard"
                element={
                  <LazyRoute>
                    <AdminDashboard />
                  </LazyRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <LazyRoute>
                    <AdminUsers />
                  </LazyRoute>
                }
              />
              <Route
                path="/admin/channels"
                element={
                  <LazyRoute>
                    <AdminChannels />
                  </LazyRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <LazyRoute>
                    <AdminAnalytics />
                  </LazyRoute>
                }
              />
              <Route
                path="/admin/channels/:id"
                element={
                  <LazyRoute>
                    <RequireRole roles={["Admin"]}>
                      <AdminChannelView />
                    </RequireRole>
                  </LazyRoute>
                }
              />
            </Route>
            
          </Route>
        </Route>

        {/* Catch-all */}
            <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
}
