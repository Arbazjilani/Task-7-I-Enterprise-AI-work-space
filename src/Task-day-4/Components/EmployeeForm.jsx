import React, { useState,useEffect } from "react";
import { validateEmployee } from "../utils/validations"


export default function EmployeeForm({ employees,setEmployees, editEmployee, setEditEmployee}) {

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
});
  }
}, [editEmployee]);

    const[formData,setFormData]=useState({
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
    });

    const[errors,setErrors]=useState({});

      // ✅ STEP 2 GOES HERE (IMAGE HANDLER)
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        setFormData({
          ...formData,
          image: reader.result,
        });
      };

      reader.readAsDataURL(file);
    }
  };

     const handlechange = (e) => {
  const { name, value } = e.target;

  setFormData({
    ...formData,
    [name]:
      name === "experience" || name === "salary"
        ? value === "" ? "" : Number(value)
        : value,
  });
};

 const handleSubmit=(e)=>{
    e.preventDefault();
    const errors=validateEmployee(formData);
    console.log(errors);

   setErrors(errors);
     if (Object.keys(errors).length > 0) {
    return;
  }



     if (editEmployee) {
  const updated = employees.map((emp) =>
    emp.empId === editEmployee.empId ? formData : emp
  );
  setEmployees(updated);
  setEditEmployee(null);
} else {
  setEmployees([...employees, formData]);
}
       setFormData({
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
  });
setEditEmployee(null); // ✔️ keep this here too (safe reset)
 }

 return (
    <div className="min-h-screen bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {editEmployee ? "Update Employee Details" : "Add Employee Details"}
        </h1>

        {/* <div className="mb-8 flex justify-center">
          <img
            src=""
            alt=""
            className="w-24 h-24 rounded-full border-2 border-gray-300 shadow-md"
          />
        </div> */}

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
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
  {errors.name}
</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
  {errors.email}
</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                  value={formData.phone}
                  onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
  {errors.phone}
</p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
  {errors.dob}
</p>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
              onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
  {errors.address}
</p>
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
                id="empId"
                name="empId"
                  value={formData.empId}
                   onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
    {errors.empId}
  </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
    {errors.department}
  </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
    {errors.designation}
  </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Experience</label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
    {errors.experience}
  </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Joining Date</label>
              <input
                type="date"
                id="joiningDate"
                name="joiningDate"
                  value={formData.joiningDate}
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
    {errors.joiningDate}
  </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Salary</label>
              <input
                type="number"
                id="salary"
                name="salary"
                   value={formData.salary}
                  onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              <p className="text-red-500 text-sm">
    {errors.salary}
  </p>
            </div>

            {/* Active Status */}
            <div>
              <label className="block mb-2 font-medium">Status</label>
              <select
                id="status"
                name="status"
                 value={formData.status}
                onChange={handlechange}
                className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
                <p className="text-red-500 text-sm">
    {errors.status}
  </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 font-semibold"
          >
            {editEmployee ? "Update Employee" : "Add Employee"}
          </button>
        </div>

      </form>
    </div>
  );
}