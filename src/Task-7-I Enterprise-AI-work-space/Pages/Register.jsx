import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    role: "employee",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Backend requires minimum 8 characters
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        password: formData.password,
        department: formData.department.trim(),
        role: formData.role,
      };

      console.log("REGISTER DATA:", registerData);

      const response = await api.post(
        "/api/auth/register",
        registerData
      );

      console.log("REGISTER RESPONSE:", response.data);

      alert("Registration Successful!");

      navigate("/login");
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      console.error("REGISTER ERROR RESPONSE:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        alert(
          detail
            .map((item) => item.msg || "Validation error")
            .join("\n")
        );
      } else {
        alert(
          detail ||
            error.response?.data?.message ||
            "Registration Failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Enterprise AI Workspace
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Create your account
        </p>

        {/* REGISTER FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-8">

          {/* FULL NAME */}
          <div>
            <label className="font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              minLength={2}
              maxLength={100}
              className="w-full border rounded-lg p-3 mt-2 focus:ring-2 focus:ring-blue-600 outline-none"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full border rounded-lg p-3 mt-2 focus:ring-2 focus:ring-blue-600 outline-none"
              required
            />
          </div>

          {/* DEPARTMENT */}
          <div>
            <label className="font-medium">
              Department
            </label>

            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Engineering"
              className="w-full border rounded-lg p-3 mt-2 focus:ring-2 focus:ring-blue-600 outline-none"
              required
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="font-medium">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2 bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              required
            >
              <option value="employee">
                Employee
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              minLength={8}
              maxLength={128}
              className="w-full border rounded-lg p-3 mt-2 focus:ring-2 focus:ring-blue-600 outline-none"
              required
            />

            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters
            </p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              minLength={8}
              maxLength={128}
              className="w-full border rounded-lg p-3 mt-2 focus:ring-2 focus:ring-blue-600 outline-none"
              required
            />
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}

          <Link
            to="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}