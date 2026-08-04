import React, { useState } from "react";
import { Link } from "react-router-dom";
import employeeData from "../Data/EmployeeData";

export default function Employees() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const employeesPerPage = 5;

  const departments = [
    "All",
    ...new Set(employeeData.map((emp) => emp.department)),
  ];

  const filteredEmployees = employeeData
    .filter((employee) => {
      const matchesSearch = employee.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDepartment =
        department === "All" ||
        employee.department === department;

      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.id - b.id
        : b.id - a.id
    );

  const totalPages = Math.ceil(
    filteredEmployees.length / employeesPerPage
  );

  const startIndex =
    (currentPage - 1) * employeesPerPage;

  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Employees
        </h1>

        <p className="text-slate-600 mt-2">
          Manage employee records
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:flex-1 border border-slate-300 rounded-lg px-4 py-2"
        />

        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-auto border border-slate-300 rounded-lg px-4 py-2"
        >
          {departments.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full md:w-auto border border-slate-300 rounded-lg px-4 py-2"
        >
          <option value="asc">ID Asc</option>
          <option value="desc">ID Desc</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Designation</th>
              <th className="p-4 text-left">Profile</th>
            </tr>
          </thead>

          <tbody>
            {currentEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-4">{employee.id}</td>
                <td className="p-4">{employee.name}</td>
                <td className="p-4">{employee.email}</td>
                <td className="p-4">
                  {employee.department}
                </td>
                <td className="p-4">
                  {employee.designation}
                </td>

                <td className="p-4">
                  <Link
                    to={`/employees/${employee.id}`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {currentEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white rounded-xl shadow p-4"
          >
            <div className="space-y-2">
              <p>
                <span className="font-semibold">
                  ID:
                </span>{" "}
                {employee.id}
              </p>

              <p>
                <span className="font-semibold">
                  Name:
                </span>{" "}
                {employee.name}
              </p>

              <p className="break-all">
                <span className="font-semibold">
                  Email:
                </span>{" "}
                {employee.email}
              </p>

              <p>
                <span className="font-semibold">
                  Department:
                </span>{" "}
                {employee.department}
              </p>

              <p>
                <span className="font-semibold">
                  Designation:
                </span>{" "}
                {employee.designation}
              </p>

              <Link
                to={`/employees/${employee.id}`}
                className="inline-block mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => prev - 1)
          }
          className="w-full sm:w-auto px-4 py-2 bg-slate-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => prev + 1)
          }
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}