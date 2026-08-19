import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/api";

import {
  Bell,
  ShieldCheck,
  Home,
  FileText,
  Users
} from "lucide-react";

const navItems = [
  {
    path: "/student/dashboard",
    label: "Dashboard",
    icon: Home,
    role: "student"
  },
  {
    path: "/student/profile",
    label: "Profile",
    icon: ShieldCheck,
    role: "student"
  },
  {
    path: "/student/admission",
    label: "Admission",
    icon: FileText,
    role: "student"
  },
  {
    path: "/student/documents",
    label: "Documents",
    icon: FileText,
    role: "student"
  },
  {
    path: "/student/notifications",
    label: "Notifications",
    icon: Bell,
    role: "student"
  },
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: Home,
    role: "admin"
  },
  {
    path: "/admin/applications",
    label: "Applications",
    icon: Users,
    role: "admin"
  },
  {
    path: "/admin/notifications",
    label: "Notifications & Events",
    icon: Bell,
    role: "admin"
  }
];

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { dark, setDark } = useTheme();

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (user?.role === "student") {
      api
        .get("/notifications/unread-count")
        .then((res) => {
          setCount(res.data.count);
        })
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 p-6">

        <aside className="card-glass p-6 rounded-3xl border-slate-200/70 dark:border-slate-700/70">

          <div className="mb-8">
            <div className="text-brand-600 font-semibold text-sm uppercase tracking-[0.2em]">
              SAMS
            </div>

            <h1 className="mt-4 text-3xl font-semibold">
              Admission Control
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Secure university admission workflow.
            </p>
          </div>

          <button
            onClick={() => setDark(!dark)}
            className="mb-6 w-full rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-2"
          >
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <nav className="space-y-2">

            {navItems
              .filter((item) => item.role === user?.role)
              .map((item) => {

                const Icon = item.icon;

                const active =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-brand-500 text-white shadow-lg"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">

                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        {item.label}
                      </div>

                      {item.path ===
                        "/student/notifications" &&
                        count > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {count}
                          </span>
                        )}

                    </div>
                  </Link>
                );
              })}
          </nav>

          <div className="mt-10 border-t border-slate-200/70 pt-6 dark:border-slate-700/70">

            <div className="text-sm text-slate-500 dark:text-slate-400">
              Signed in as
            </div>

            <div className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              {user?.fullName || user?.email}
            </div>

            <button
              onClick={logout}
              className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign Out
            </button>

          </div>

        </aside>

        <main className="space-y-6">
          {children}
        </main>

      </div>
    </div>
  );
}

export default Layout;