import React, { useEffect, useState } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleThemeChange = () => {
    const newTheme = !darkMode;

    setDarkMode(newTheme);

    if (newTheme) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Settings
      </h1>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Theme Settings
          </h2>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleThemeChange}
            />
            <span>Enable Dark Mode</span>
          </label>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Notification Settings
          </h2>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() =>
                setNotifications(!notifications)
              }
            />
            <span>Email Notifications</span>
          </label>
        </div>

        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Profile Settings
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-3 rounded-lg"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border p-3 rounded-lg"
            />

            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}