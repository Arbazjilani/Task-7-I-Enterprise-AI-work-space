import React, { useState } from "react";

export default function EmployeeTable({ employees=[], setEditEmployee, handleDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

const safeEmployees = Array.isArray(employees) ? employees : [];

const totalPages = Math.ceil(
  safeEmployees.length / recordsPerPage
);

const startIndex = (currentPage - 1) * recordsPerPage;

const currentEmployees = safeEmployees.slice(
  startIndex,
  startIndex + recordsPerPage
);

console.log("employees prop:", employees);
console.log("safeEmployees:", safeEmployees);


  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Profile</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Department</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Joining Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((employee, index) => (
              <tr key={employee.id || index} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <img
                    src={employee.image || "https://via.placeholder.com/40"}
                    alt="emp"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>
                <td className="p-3">{employee.empId}</td>
                <td className="p-3">{employee.name}</td>
                <td className="p-3">{employee.email}</td>
                <td className="p-3">{employee.phone}</td>
                <td className="p-3">{employee.department}</td>
                <td className="p-3">{employee.designation}</td>
                <td className="p-3">{employee.experience} yrs</td>
                <td className="p-3">{employee.joiningDate}</td>
                <td className="p-3">
                  <span
                    className={`font-semibold ${
                      employee.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="p-3 space-x-2 flex justify-center items-center">
                  <button
                    onClick={() => setEditEmployee(employee)}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white transition-all duration-200 shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition"
          >
            Previous
          </button>

          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}