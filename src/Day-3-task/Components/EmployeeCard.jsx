import React from "react";



export default function EmployeeCard({ employees, toggleStatus, darkMode }) {

  if (employees.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <p
          className={`text-xl font-semibold text-center ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          No Employee Found
        </p>
      </div>
    );
  }

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 py-4">
    
      {employees.map((emp) => (
        <div
          key={emp.id}
          className={`rounded-2xl shadow-md hover:shadow-xl p-5 flex flex-col items-center text-center transition-all duration-300 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}
        >
          <img
            src={emp.image}
            alt={emp.name}
            className="w-20 h-20 rounded-full mb-3 object-cover border-2 border-indigo-400"
          />

          <h2 className="text-lg font-bold">{emp.name}</h2>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {emp.employeeId}
          </p>

          <p className="mt-2 font-medium">{emp.designation}</p>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {emp.department} · {emp.experience}
          </p>

          <span
            className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
              emp.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {emp.status}
          </span>

         
          <button
            onClick={() => toggleStatus(emp.id)}
            className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              emp.status === "Active"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {emp.status === "Active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      ))}
    </div>
  );
}
