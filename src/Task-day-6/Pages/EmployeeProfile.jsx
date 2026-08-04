import React from "react";
import { useParams } from "react-router-dom";
import employeeData from "../Data/EmployeeData";

export default function EmployeeProfile() {
  const { id } = useParams();

  const employee = employeeData.find(
    (emp) => emp.id === Number(id)
  );

  if (!employee) {
    return (
      <h2 className="text-xl font-bold">
        Employee Not Found
      </h2>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src="https://via.placeholder.com/150"
          alt={employee.name}
          className="w-40 h-40 rounded-full object-cover border"
        />

        <div>
          <h1 className="text-3xl font-bold mb-4">
            {employee.name}
          </h1>

          <p><strong>Email:</strong> {employee.email}</p>

          <p>
            <strong>Department:</strong>{" "}
            {employee.department}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {employee.designation}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {employee.status}
          </p>

          <p>
            <strong>Experience:</strong> 3 Years
          </p>
        </div>
      </div>
    </div>
  );
}