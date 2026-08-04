import React from "react";


export default function SearchBar({ searchText, setSearchText, darkMode }) {
  return (
    <div className="px-4 sm:px-6 py-4">
      <input
        type="text"
        value={searchText}
      
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search employee by name..."
        className={`w-full sm:w-1/2 md:w-1/3 px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-300 ${
          darkMode
            ? "bg-gray-800 text-white border-gray-700 placeholder-gray-400"
            : "bg-white text-gray-800 border-gray-300 placeholder-gray-400"
        }`}
      />
    </div>
  );
}
