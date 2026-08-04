import React from "react";

export default function SearchBar({
  search,
  setSearch,
}) {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search Employee Name..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="
          w-[70%]
          border
          border-gray-300
          p-3
          rounded-lg
          shadow-sm
          bg-white
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}