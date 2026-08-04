import React from "react";

export default function EmployeeTable({ employees, setEditEmployee ,  handleDelete, handleImageUpload}) {
  return (
  <>
   <div className="bg-white rounded-xl shadow-md overflow-x-auto">
      <table className="w-full">
         <thead className="bg-blue-600 text-white">
               <tr>
                      <th className="p-3">Employee ID</th>
            <th className="p-3">Profile Image</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Mobile Number</th>
            <th className="p-3">Department</th>
            <th className="p-3">Designation</th>
            <th className="p-3">Experience</th>
            <th className="p-3">Joining Date</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
               </tr>
         </thead>
           <tbody>
              {
                employees.map((employee, index)=>{
                    return(
                          <tr
                key={index}
                className="border-b hover:bg-gray-50"
              >
       <td className="p-3">
  <label className="cursor-pointer">
    <img
      src={employee.image }
      alt="emp"
      className="w-10 h-10 rounded-full object-cover border"
    />

    {/* hidden input */}
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) =>
        handleImageUpload(employee.empId, e.target.files[0])
      }
    />
  </label>
</td>
                <td className="p-3">{employee.empId}</td>
                <td className="p-3">{employee.name}</td>
                <td className="p-3">{employee.email}</td>
                <td className="p-3">{employee.phone}</td>
                <td className="p-3">{employee.department}</td>
                <td className="p-3">{employee.designation}</td>
                <td className="p-3">{employee.experience}</td>
                <td className="p-3">{employee.joiningDate}</td>

                <td className="p-3">
                    <span className={`font-semibold ${
                        employee.status==="Active"?"text-green-600":"text-red-600"
                    }`}>
                            {employee.status}
                    </span>

                </td>

                 <td className="p-3 space-x-2 flex justify-center items-center">
  
  {/* EDIT BUTTON */}
  <button
    onClick={() => setEditEmployee(employee)}
    className="px-3 py-1.5 rounded-md text-sm font-medium 
               bg-yellow-100 text-yellow-700 
               hover:bg-yellow-500 hover:text-white 
               transition-all duration-200 shadow-sm"
  >
    Edit
  </button>

  {/* DELETE BUTTON */}
  <button
    onClick={() => handleDelete(employee.empId)}
    className="px-3 py-1.5 rounded-md text-sm font-medium 
               bg-red-100 text-red-700 
               hover:bg-red-500 hover:text-white 
               transition-all duration-200 shadow-sm"
  >
    Delete
  </button>

</td>
              </tr>


             
                    );
                })
              }
           </tbody>

      </table>
   </div>
  </>
  )
}