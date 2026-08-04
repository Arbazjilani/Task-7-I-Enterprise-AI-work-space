import React from "react";

export default function EmployeeCard({ employees,setEditEmployee ,handleDelete,  handleImageUpload}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {employees.map((employee, index) => {
        return (
          <div
  key={index}
  className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition"
>
  {/* Profile Image */}
 <div className="flex justify-center">
  <label className="cursor-pointer">
    <img
      src={employee.image }
      alt="employee"
      className="w-24 h-24 rounded-full border-4 border-blue-200 object-cover"
    />

    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) =>
        handleImageUpload(employee.empId, e.target.files[0])
      }
    />
  </label>
</div>

  {/* Name & Designation */}
  <h2 className="text-xl font-bold text-center mt-4 text-gray-800">
    {employee.name}
  </h2>

  <p className="text-center text-gray-500 mb-4">
    {employee.designation}
  </p>

  {/* Employee Details */}
  <div className="space-y-2 text-sm">
    <p>
      <span className="font-semibold">Employee ID:</span>{" "}
      {employee.empId}
    </p>

    <p>
      <span className="font-semibold">Email:</span>{" "}
      {employee.email}
    </p>

    <p>
      <span className="font-semibold">Mobile:</span>{" "}
      {employee.phone}
    </p>

    <p>
      <span className="font-semibold">Department:</span>{" "}
      {employee.department}
    </p>

    <p>
      <span className="font-semibold">Designation:</span>{" "}
      {employee.designation}
    </p>

    <p>
      <span className="font-semibold">Experience:</span>{" "}
      {employee.experience}
    </p>

    <p>
      <span className="font-semibold">Joining Date:</span>{" "}
      {employee.joiningDate}
    </p>

    <p>
      <span className="font-semibold">Status:</span>

      <span
        className={`ml-2 px-2 py-1 rounded text-white text-xs ${
          employee.status === "Active"
            ? "bg-green-500"
            : "bg-red-500"
        }`}
      >
        {employee.status}
      </span>
    </p>
  </div>

  {/* Buttons */}
  <div className="flex gap-2 mt-5">
    <button className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
    
      onClick={() => setEditEmployee(employee)}>
      Edit
    </button>

    <button className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
    onClick={() => handleDelete(employee.empId)}
    >
      Delete
    </button>
  </div>
</div>
        );
      })}

    </div>
  );
}