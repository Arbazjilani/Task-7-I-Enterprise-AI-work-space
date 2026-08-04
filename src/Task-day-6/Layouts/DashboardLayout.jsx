import React from "react";
import Breadcrumb from "../component/Breadcrumb";
import {
  Link,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-400 transition-all duration-300 hover:text-white hover:scale-105 hover:drop-shadow-lg inline-block"
          >
            RothDesk
          </Link>

          <p className="text-sm text-slate-400">
            Employee Portal
          </p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                className={`block px-4 py-3 rounded-xl transition ${
                  location.pathname === "/dashboard"
                    ? "bg-indigo-600"
                    : "hover:bg-slate-800"
                }`}
              >
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/employees"
                className={`block px-4 py-3 rounded-xl transition ${
                  location.pathname.startsWith("/employees")
                    ? "bg-indigo-600"
                    : "hover:bg-slate-800"
                }`}
              >
                Employees
              </Link>
            </li>

            <li>
              <a
                href="#departments"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition"
              >
                Departments
              </a>
            </li>

            <li>
              <a
                href="#reports"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition"
              >
                Reports
              </a>
            </li>

            <li>
              <Link
                to="/settings"
                className={`block px-4 py-3 rounded-xl transition ${
                  location.pathname === "/settings"
                    ? "bg-indigo-600"
                    : "hover:bg-slate-800"
                }`}
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <Breadcrumb />
        <Outlet />
      </main>
    </div>
  );
}