import React from "react";


const departments = ["All", "Frontend", "Backend", "UI/UX", "QA", "HR"];

export default function DepartmentFilter({
  selectedDepartment,
  setSelectedDepartment,
  darkMode,
}) {
  return (
    <div className="px-4 sm:px-6 py-2 flex flex-wrap gap-2 sm:gap-3">
    
      {departments.map((dept) => {
        
        const isSelected = selectedDepartment === dept;

        return (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              isSelected
                ? "bg-indigo-600 text-white shadow-md"
                : darkMode
                ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {dept}
          </button>
        );
      })}
    </div>
  );
}