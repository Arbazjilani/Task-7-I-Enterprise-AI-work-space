import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import {
  getCurrentUserProfile,
  updateProfile,
} from "../services/auth.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  // ==========================================
  // STORED USER
  // ==========================================

  const storedUser = localStorage.getItem("user");

  let initialUser = null;

  try {
    initialUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid stored user:", error);
    initialUser = null;
  }

  // ==========================================
  // THEME
  // ==========================================

  const { darkMode, setDarkMode } = useTheme();

  // ==========================================
  // STATE
  // ==========================================

  const [user, setUser] = useState(initialUser);

  const [profile, setProfile] = useState({
    full_name: initialUser?.full_name || "",
    email: initialUser?.email || "",
    department: initialUser?.department || "",
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications_enabled");

    if (saved === null) {
      return true;
    }

    return saved === "true";
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // GET SAFE ROLE VALUE
  // ==========================================

  const getRoleName = (role) => {
    if (!role) {
      return "—";
    }

    // If backend returns role as string
    if (typeof role === "string") {
      return role;
    }

    // If backend returns role as object
    if (typeof role === "object") {
      return (
        role.name ||
        role.role_name ||
        role.title ||
        role.code ||
        "—"
      );
    }

    return String(role);
  };

  // ==========================================
  // LOAD PROFILE FROM BACKEND
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCurrentUserProfile();

        console.log("SETTINGS PROFILE:", data);
        console.log("SETTINGS ROLE:", data?.role);

        setUser(data);

        setProfile({
          full_name: data?.full_name || "",
          email: data?.email || "",
          department: data?.department || "",
        });

        // Keep localStorage synchronized
        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );
      } catch (error) {
        console.error(
          "Error loading profile:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================================
  // PROFILE INPUT CHANGE
  // ==========================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // ==========================================
  // NOTIFICATION PREFERENCE
  // FRONTEND ONLY
  // ==========================================

  const handleNotificationChange = () => {
    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "notifications_enabled",
      String(newValue)
    );
  };

  // ==========================================
  // DARK MODE
  // FRONTEND ONLY
  // ==========================================

  const handleDarkModeChange = () => {
    setDarkMode(!darkMode);
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

 

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className={`flex min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gray-100"
      }`}
    >
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar user={user} />

        <main className="w-full p-3 sm:p-4 md:p-6">

          {/* ======================================
              PAGE HEADER
          ====================================== */}

          <div
            className={`
              rounded-xl
              shadow-sm
              p-4 sm:p-5 md:p-6
              mb-6
              ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-900"
              }
            `}
          >
            <h1 className="text-2xl sm:text-3xl font-bold">
              Workspace Settings
            </h1>

            <p
              className={`mt-2 text-sm sm:text-base ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Manage your profile and workspace preferences.
            </p>
          </div>

          {/* ======================================
              ERROR MESSAGE
          ====================================== */}

          {error && (
            <div
              className={`
                mb-6
                px-4 py-3
                rounded-lg
                border
                ${
                  darkMode
                    ? "bg-red-900/30 border-red-700 text-red-300"
                    : "bg-red-100 border-red-300 text-red-700"
                }
              `}
            >
              {error}
            </div>
          )}

          {/* ======================================
              SUCCESS MESSAGE
          ====================================== */}

          {success && (
            <div
              className={`
                mb-6
                px-4 py-3
                rounded-lg
                border
                ${
                  darkMode
                    ? "bg-green-900/30 border-green-700 text-green-300"
                    : "bg-green-100 border-green-300 text-green-700"
                }
              `}
            >
              {success}
            </div>
          )}

          {/* ======================================
              LOADING
          ====================================== */}

          {loading ? (
            <div
              className={`
                rounded-xl
                shadow-sm
                p-6
                ${
                  darkMode
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-500"
                }
              `}
            >
              Loading settings...
            </div>
          ) : (
            <>
              {/* ==================================
                  PROFILE INFORMATION
              ================================== */}

             

              {/* ==================================
                  PREFERENCES
              ================================== */}

              <div
                className={`
                  rounded-xl
                  shadow-sm
                  p-4 sm:p-6
                  mb-6
                  ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }
                `}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    Preferences
                  </h2>

                  <p
                    className={`text-sm mt-1 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Manage your local workspace preferences.
                  </p>
                </div>

                <div className="space-y-5">

                  {/* EMAIL NOTIFICATIONS */}

                  <div
                    className={`
                      flex
                      items-center
                      justify-between
                      gap-4
                      py-4
                      border-b
                      ${
                        darkMode
                          ? "border-gray-700"
                          : "border-gray-200"
                      }
                    `}
                  >
                    <div>
                      <p className="font-medium">
                        Email Notifications
                      </p>

                      <p
                        className={`text-sm mt-1 ${
                          darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Enable or disable notification preference.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={handleNotificationChange}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>

                  {/* DARK MODE */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      py-4
                    "
                  >
                    <div>
                      <p className="font-medium">
                        Dark Mode
                      </p>

                      <p
                        className={`text-sm mt-1 ${
                          darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Switch between light and dark workspace themes.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={handleDarkModeChange}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* ==================================
                  ACCOUNT INFORMATION
              ================================== */}

              <div
                className={`
                  rounded-xl
                  shadow-sm
                  p-4 sm:p-6
                  mb-6
                  ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }
                `}
              >
                <h2 className="text-xl font-semibold mb-5">
                  Account Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* USER ID */}

                  <div>
                    <p
                      className={`text-sm ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      User ID
                    </p>

                    <p className="font-medium mt-1">
                      {user?.id ?? "—"}
                    </p>
                  </div>

                  {/* ROLE - FIXED */}

                  <div>
                    <p
                      className={`text-sm ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      Role
                    </p>

                    <p className="font-medium mt-1 capitalize">
                      {getRoleName(user?.role)}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div>
                    <p
                      className={`text-sm ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      Status
                    </p>

                    <p
                      className={`font-medium mt-1 ${
                        user?.is_active === false
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {user?.is_active === false
                        ? "Inactive"
                        : "Active"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================
                  SAVE BUTTON
              ================================== */}

             
            </>
          )}
        </main>
      </div>
    </div>
  );
}