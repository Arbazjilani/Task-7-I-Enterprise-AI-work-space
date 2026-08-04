import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET all employees
export const getEmployees = async () => {
  const response = await axiosInstance.get("/employees");
  return response.data;
};

// GET employees with search query
export const searchEmployees = async (query) => {
  const response = await axiosInstance.get("/employees", {
    params: { q: query },
  });

  return response.data;
};

// POST - Add new employee
export const addEmployee = async (employeeData) => {
  const response = await axiosInstance.post("/employees", employeeData);
  return response.data;
};

// PUT - Update employee
export const updateEmployee = async (id, employeeData) => {
  const response = await axiosInstance.put(`/employees/${id}`, employeeData);
  return response.data;
};

// DELETE - Delete employee
export const deleteEmployee = async (id) => {
  const response = await axiosInstance.delete(`/employees/${id}`);
  return response.data;
};
