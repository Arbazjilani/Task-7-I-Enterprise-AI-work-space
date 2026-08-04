import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth.js";
import api from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // 1. Login
      const response = await login(
        formData.email,
        formData.password
      );

      console.log("Login Response:", response);

      // 2. Save access token
      localStorage.setItem(
        "access_token",
        response.access_token
      );

      // Save refresh token only if backend returns one
      if (response.refresh_token) {
        localStorage.setItem(
          "refresh_token",
          response.refresh_token
        );
      }

      // 3. Get real logged-in user profile
      const profileResponse = await api.get("/api/auth/me");

      const user = profileResponse.data;

      console.log("Logged In User:", user);

      // 4. Save complete user profile
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // 5. Login completed
      alert("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);

      // Clean incomplete login data
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      if (err.response) {
        setError(
          err.response.data?.detail ||
          "Invalid email or password"
        );
      } else {
        setError(
          "Cannot connect to backend server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8">

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700">
          Enterprise AI Workspace
        </h1>

        <p className="text-center text-gray-500 mt-2 text-sm sm:text-base">
          Sign in to continue
        </p>

        {error && (
          <div className="mt-5 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 sm:mt-8 space-y-5"
        >
          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="font-medium text-sm sm:text-base"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="
                w-full
                border
                rounded-lg
                p-3
                mt-2
                text-sm sm:text-base
                focus:ring-2
                focus:ring-blue-600
                outline-none
              "
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="font-medium text-sm sm:text-base"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="
                w-full
                border
                rounded-lg
                p-3
                mt-2
                text-sm sm:text-base
                focus:ring-2
                focus:ring-blue-600
                outline-none
              "
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-700
              hover:bg-blue-800
              active:bg-blue-900
              disabled:bg-gray-400
              text-white
              py-3
              rounded-lg
              font-medium
              transition
            "
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm sm:text-base">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-700 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}