import React from "react";

export default function SortDropdown({ sortBy, setSortBy }) {
  return (
    <div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="
          w-full
          md:w-64
          px-4
          py-3
          border
          border-gray-300
          rounded-lg
          bg-white
          text-gray-700
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        <option value="">Sort By...</option>
        <option value="name">Name A-Z</option>
        <option value="expLow">Experience (Low to High)</option>
        <option value="expHigh">Experience (High to Low)</option>
        <option value="date">Joining Date</option>
      </select>
    </div>
  );
}