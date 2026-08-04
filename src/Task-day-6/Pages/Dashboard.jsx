import React from "react";
import employeeData from "../Data/EmployeeData";

export default function Dashboard() {
  const totalEmployees = employeeData.length;

  const activeEmployees = employeeData.filter(
    (employee) => employee.status === "Active"
  ).length;

  const totalDepartments = new Set(
    employeeData.map((employee) => employee.department)
  ).size;

  const departmentCounts = employeeData.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const recentEmployees = employeeData.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-slate-600 mt-2 text-sm md:text-base">
          Welcome to RothDesk Employee Portal
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-slate-500 text-sm">
            Total Employees
          </h3>

          <p className="text-3xl md:text-4xl font-bold text-indigo-600 mt-2">
            {totalEmployees}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-slate-500 text-sm">
            Active Employees
          </h3>

          <p className="text-3xl md:text-4xl font-bold text-green-600 mt-2">
            {activeEmployees}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-slate-500 text-sm">
            Departments
          </h3>

          <p className="text-3xl md:text-4xl font-bold text-purple-600 mt-2">
            {totalDepartments}
          </p>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="bg-white rounded-2xl shadow p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">
          Recent Employees
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Designation</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-4">{employee.name}</td>
                  <td className="p-4">{employee.department}</td>
                  <td className="p-4">
                    {employee.designation}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        employee.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments Section */}
      <div
        id="departments"
        className="bg-white rounded-2xl shadow p-4 md:p-6 mt-8"
      >
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">
          Departments
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(departmentCounts).map(
            ([department, count]) => (
              <div
                key={department}
                className="bg-indigo-50 p-4 rounded-xl"
              >
                <h3 className="font-semibold">
                  {department}
                </h3>

                <p className="text-slate-600">
                  {count} Employees
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Reports Section */}
      <div
        id="reports"
        className="bg-white rounded-2xl shadow p-4 md:p-6 mt-8"
      >
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">
          Reports
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-xl p-4">
            <h3 className="text-slate-500">
              Total Employees
            </h3>

            <p className="text-2xl font-bold text-indigo-600">
              {totalEmployees}
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h3 className="text-slate-500">
              Active Employees
            </h3>

            <p className="text-2xl font-bold text-green-600">
              {activeEmployees}
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h3 className="text-slate-500">
              Departments
            </h3>

            <p className="text-2xl font-bold text-purple-600">
              {totalDepartments}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}