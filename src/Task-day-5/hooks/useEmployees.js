import { useState, useEffect, useCallback } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
} from "../services/employeeService";

export default function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = await getEmployees();

      console.log("API Response:", data);
      console.log("Is Array:", Array.isArray(data));

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to fetch employee data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Add employee
  const handleAdd = async (formData) => {
    try {
      setError(null);
      const newEmployee = await addEmployee(formData);
      setEmployees((prev) => [...prev, newEmployee]);
      return true;
    } catch (err) {
      setError("Failed to add employee. Please try again.");
      return false;
    }
  };

  // Update employee
  const handleUpdate = async (id, formData) => {
    try {
      setError(null);
      const updated = await updateEmployee(id, formData);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? updated : emp)),
      );
      return true;
    } catch (err) {
      setError("Failed to update employee. Please try again.");
      return false;
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );
    if (!confirmed) return;

    try {
      setError(null);
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      setError("Failed to delete employee. Please try again.");
    }
  };

  // Search employees from API
  const handleSearch = async (query) => {
    if (query.trim() === "") {
      fetchEmployees();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await searchEmployees(query);
      setEmployees(data);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleSearch,
  };
}
