export const validateEmployee = (formData) => {
  const errors = {};

  // Full Name
  if (formData.name.trim() === "") {
    errors.name = "Name cannot be empty";
  }

  // Email
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.com$/;

  if (formData.email.trim() === "") {
    errors.email = "Email is required";
  } else if (emailRegex.test(formData.email) === false) {
    errors.email = "Invalid email address";
  }

  // Phone
  const phoneRegex = /^[0-9]{10}$/;

  if (formData.phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else if (phoneRegex.test(formData.phone) === false) {
    errors.phone = "Mobile number should contain 10 digits";
  }

  // Date of Birth
  if (formData.dob === "") {
    errors.dob = "Date of Birth is required";
  }

  // Address
  if (formData.address.trim() === "") {
    errors.address = "Address is required";
  }

  // Employee ID
  if (formData.empId.trim() === "") {
    errors.empId = "Employee ID is required";
  }

  // Department
  if (formData.department.trim() === "") {
    errors.department = "Department is required";
  }

  // Designation
  if (formData.designation.trim() === "") {
    errors.designation = "Designation is required";
  }

  // Experience
  if (
    formData.experience === "" ||
    formData.experience === null ||
    formData.experience === undefined ||
    isNaN(formData.experience)
  ) {
    errors.experience = "Experience is required";
  }
  // Joining Date
  if (formData.joiningDate === "") {
    errors.joiningDate = "Joining Date is required";
  }

  // Salary
  if (
    formData.salary === "" ||
    formData.salary === null ||
    formData.salary === undefined ||
    isNaN(formData.salary)
  ) {
    errors.salary = "Salary is required";
  }

  // Status
  if (formData.status === "") {
    errors.status = "Please select a status";
  }

  return errors;
};
