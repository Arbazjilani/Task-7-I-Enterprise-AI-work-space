import React from "react";


export default function Navbar({ darkMode, toggleDarkMode }) {
  return (
    <nav
      className={`flex items-center justify-between px-4 sm:px-6 py-4 shadow-md transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <h1 className="text-lg sm:text-2xl font-bold">
        Employee Management Dashboard
      </h1>

   
      <button
        onClick={toggleDarkMode}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
          darkMode
            ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
            : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
      >
        {/* Conditional rendering  darkMode value. */}
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
    </nav>
  );
}