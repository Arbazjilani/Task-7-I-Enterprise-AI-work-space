import React, { useState, useEffect } from "react";
import { validateEmployee } from "../utils/validators";

export default function EmployeeForm({
  editEmployee,
  setEditEmployee,
  handleAdd,
  handleUpdate,
}) {
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    empId: "",
    department: "",
    designation: "",
    experience: "",
    joiningDate: "",
    salary: "",
    status: "",
    image: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editEmployee) {
      setFormData({
        name: editEmployee.name || "",
        email: editEmployee.email || "",
        phone: editEmployee.phone || "",
        dob: editEmployee.dob || "",
        address: editEmployee.address || "",
        empId: editEmployee.empId || "",
        department: editEmployee.department || "",
        designation: editEmployee.designation || "",
        experience: editEmployee.experience || "",
        joiningDate: editEmployee.joiningDate || "",
        salary: editEmployee.salary || "",
        status: editEmployee.status || "",
        image: editEmployee.image || "",
      });
    }
  }, [editEmployee]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "experience" || name === "salary"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateEmployee(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    let success;
    if (editEmployee) {
      success = await handleUpdate(editEmployee.id, formData);
    } else {
      success = await handleAdd(formData);
    }

    if (success) {
      setFormData(emptyForm);
      setEditEmployee(null);
      setErrors({});
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {editEmployee ? "Update Employee Details" : "Add Employee Details"}
        </h1>

        {/* Personal Details */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-blue-600 border-b pb-2 mb-6">
            Personal Details
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.name}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.email}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.phone}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.dob}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.address}</p>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div>
          <h3 className="text-xl font-semibold text-green-600 border-b pb-2 mb-6">
            Professional Details
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 font-medium">Employee ID</label>
              <input
                type="text"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.empId}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.department}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.designation}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Experience (Years)</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.experience}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.joiningDate}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Salary</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">{errors.salary}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <p className="text-red-500 text-sm">{errors.status}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {editEmployee && (
            <button
              type="button"
              onClick={() => {
                setEditEmployee(null);
                setFormData(emptyForm);
                setErrors({});
              }}
              className="bg-gray-400 text-white px-8 py-3 rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? editEmployee
                ? "Updating..."
                : "Adding..."
              : editEmployee
              ? "Update Employee"
              : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
