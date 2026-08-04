import React from "react";

export default function Dashboard({ employees }) {

const totalEmployees = employees.length;

let activeEmployees = 0;
let inactiveEmployees = 0;

for (let i = 0; i < employees.length; i++) {
  if (employees[i].status === "Active") {
    activeEmployees++;
  }

  if (employees[i].status === "Inactive") {
    inactiveEmployees++;
  }
}

let departments = [];

employees.filter((employee) => {
  if (departments.includes(employee.department) === false) {
    departments.push(employee.department);
  }
});

const totalDepartments = departments.length;
  return (
    <div className="p-6 bg-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Employees */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
          <h4 className="text-gray-500 text-sm font-medium">
            Total Employees
          </h4>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {totalEmployees}
          </h2>
        </div>

        {/* Active Employees */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
          <h4 className="text-gray-500 text-sm font-medium">
            Active
          </h4>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {activeEmployees}
          </h2>
        </div>

        {/* Inactive Employees */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
          <h4 className="text-gray-500 text-sm font-medium">
            Inactive
          </h4>
          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {inactiveEmployees}
          </h2>
        </div>

        {/* Departments */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
          <h4 className="text-gray-500 text-sm font-medium">
            Departments
          </h4>
          <h2 className="text-3xl font-bold text-purple-600 mt-2">
            {totalDepartments}
          </h2>
        </div>

      </div>
    </div>
  );
}