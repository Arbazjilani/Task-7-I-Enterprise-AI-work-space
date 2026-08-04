import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Sidebar() {
  const location = useLocation();
  const { darkMode } = useTheme();

  // Get logged-in user from localStorage
  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to read user from localStorage:", error);
  }

  // Backend returns:
  // role: {
  //   id: 1,
  //   name: "admin"
  // }
  //
  // But this also supports old/localStorage formats.
  const role =
    user?.role?.name?.toLowerCase() ||
    user?.role_name?.toLowerCase() ||
    (typeof user?.role === "string"
      ? user.role.toLowerCase()
      : "employee");

  console.log("SIDEBAR USER:", user);
  console.log("SIDEBAR ROLE:", role);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "AI Chat",
      path: "/chat",
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "Documents",
      path: "/documents",
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "AI Agents",
      path: "/agents",
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "Users",
      path: "/users",
      roles: ["admin"],
    },
    {
      name: "Analytics",
      path: "/analytics",
      roles: ["admin", "manager"],
    },
    {
      name: "Settings",
      path: "/settings",
      roles: ["admin", "manager", "employee"],
    },
  ];

  // Only show menu items allowed for current role
  const allowedMenuItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside
      className={`w-64 min-h-screen text-white ${
        darkMode ? "bg-black" : "bg-slate-900"
      }`}
    >
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">Enterprise AI</h1>

        <p className="text-sm text-gray-400">
          Workspace
        </p>
      </div>

      <nav className="p-4 space-y-2">
        {allowedMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}