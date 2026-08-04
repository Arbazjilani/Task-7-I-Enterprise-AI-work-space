import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // Get role safely
  const roleName =
    typeof user?.role === "object"
      ? user?.role?.name
      : user?.role;

  // Get user's name safely
  const userName =
    user?.full_name ||
    user?.name ||
    "User";

  return (
    <header
      className={`
        w-full shadow-sm
        px-4 sm:px-5 md:px-8
        py-3 sm:py-4
        flex items-center justify-between
        gap-3
        ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }
      `}
    >
      {/* LEFT SIDE */}
      <div className="min-w-0 flex-1">
        <h2
          className={`
            text-lg sm:text-xl
            font-semibold
            truncate
            ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }
          `}
        >
          Dashboard
        </h2>

        <p
          className={`
            text-xs sm:text-sm
            truncate
            ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }
          `}
        >
          Enterprise AI Workspace
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
        {/* USER INFORMATION */}
        <div className="text-right min-w-0">
          <p
            className={`
              font-semibold
              text-sm sm:text-base
              max-w-[90px] sm:max-w-[150px]
              truncate
              ${
                darkMode
                  ? "text-white"
                  : "text-gray-800"
              }
            `}
            title={userName}
          >
            {userName}
          </p>

          <p
            className={`
              text-xs sm:text-sm
              capitalize
              truncate
              ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }
            `}
          >
            {roleName || "Employee"}
          </p>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          type="button"
          onClick={handleLogout}
          className="
            shrink-0
            px-3 sm:px-4
            py-2
            text-sm sm:text-base
            rounded-lg
            bg-red-500
            hover:bg-red-600
            active:bg-red-700
            text-white
            transition
          "
        >
          <span className="hidden sm:inline">
            Logout
          </span>

          <span className="sm:hidden">
            Exit
          </span>
        </button>
      </div>
    </header>
  );
}