import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.js";

import { useTheme } from "../context/ThemeContext.jsx";

export default function Users() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { darkMode } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role_name: "employee",
    is_active: true,
  });

  // ==========================================
  // LOAD USERS
  // ==========================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      console.log("USERS:", data);

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Error loading users:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        setError(
          "You are not authenticated. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to view users. This page requires admin access."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load users."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredUsers = users.filter((u) => {
    const name = u?.full_name || "";
    const email = u?.email || "";

    const roleName =
      typeof u?.role === "object"
        ? u?.role?.name || ""
        : u?.role || "";

    const searchValue = search
      .trim()
      .toLowerCase();

    return (
      name.toLowerCase().includes(searchValue) ||
      email.toLowerCase().includes(searchValue) ||
      roleName.toLowerCase().includes(searchValue)
    );
  });

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // OPEN ADD USER
  // ==========================================

  const handleAddUser = () => {
    setEditingUser(null);

    setFormData({
      full_name: "",
      email: "",
      password: "",
      role_name: "employee",
      is_active: true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT USER
  // ==========================================

  const handleEditUser = (selectedUser) => {
    const roleName =
      typeof selectedUser?.role === "object"
        ? selectedUser?.role?.name
        : selectedUser?.role;

    setEditingUser(selectedUser);

    setFormData({
      full_name: selectedUser?.full_name || "",
      email: selectedUser?.email || "",
      password: "",
      role_name: roleName || "employee",
      is_active:
        selectedUser?.is_active !== false,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);

    setFormData({
      full_name: "",
      email: "",
      password: "",
      role_name: "employee",
      is_active: true,
    });
  };

  // ==========================================
  // ADD / UPDATE USER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingUser) {
        // Backend UserUpdate supports:
        // full_name, email, role_name, is_active

        const updateData = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          role_name: formData.role_name,
          is_active: formData.is_active,
        };

        await updateUser(
          editingUser.id,
          updateData
        );

        setSuccess(
          "User updated successfully."
        );
      } else {
        // Backend UserCreateByAdmin supports:
        // full_name, email, password, role_name

        if (!formData.password) {
          setError(
            "Password is required when creating a user."
          );
          setSaving(false);
          return;
        }

        if (formData.password.length < 8) {
          setError(
            "Password must contain at least 8 characters."
          );
          setSaving(false);
          return;
        }

        const newUserData = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role_name: formData.role_name,
        };

        await createUser(newUserData);

        setSuccess(
          "User created successfully."
        );
      }

      setShowModal(false);
      setEditingUser(null);

      await loadUsers();
    } catch (err) {
      console.error(
        "Save user error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        setError(
          "Your login session is invalid. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to perform this action."
        );
      } else if (err.response?.status === 409) {
        setError(
          err.response?.data?.detail ||
            "A user with this email already exists."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to save user."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE / DEACTIVATE USER
  // ==========================================

  const handleDeleteUser = async (
    selectedUser
  ) => {
    const confirmed = window.confirm(
      `Deactivate ${selectedUser.full_name || "this user"}?`
    );

    if (!confirmed) return;

    setDeletingId(selectedUser.id);
    setError("");
    setSuccess("");

    try {
      await deleteUser(selectedUser.id);

      setSuccess(
        "User deactivated successfully."
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Delete user error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        setError(
          "Your login session is invalid. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to deactivate this user."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to deactivate user."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // ROLE HELPER
  // ==========================================

  const getRoleName = (u) => {
    return typeof u?.role === "object"
      ? u?.role?.name || "employee"
      : u?.role || "employee";
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className={`flex min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gray-100"
      }`}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-3 sm:p-4 md:p-6">

          {/* HEADER */}

          <div
            className={`rounded-xl shadow-sm p-4 sm:p-6 mb-6 ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white"
            }`}
          >
            <h1 className="text-2xl sm:text-3xl font-bold">
              User Management
            </h1>

            <p
              className={`mt-2 ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Manage workspace users and their roles.
            </p>
          </div>

          {/* SEARCH + ADD */}

          <div
            className={`rounded-xl shadow-sm p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 ${
              darkMode
                ? "bg-gray-800"
                : "bg-white"
            }`}
          >
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className={`border rounded-lg px-4 py-2.5 w-full sm:w-72 outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300"
              }`}
            />

            <button
              type="button"
              onClick={handleAddUser}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
            >
              + Add User
            </button>
          </div>

          {/* SUCCESS */}

          {success && (
            <div
              className={`px-4 py-3 rounded-lg mb-6 border ${
                darkMode
                  ? "bg-green-900/40 border-green-700 text-green-300"
                  : "bg-green-100 border-green-300 text-green-700"
              }`}
            >
              {success}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className={`px-4 py-3 rounded-lg mb-6 border ${
                darkMode
                  ? "bg-red-900/40 border-red-700 text-red-300"
                  : "bg-red-100 border-red-300 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {/* USERS */}

          <div
            className={`rounded-xl shadow-sm p-4 sm:p-6 overflow-x-auto ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white"
            }`}
          >
            {loading ? (
              <p
                className={
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                Loading users...
              </p>
            ) : filteredUsers.length === 0 ? (
              <p
                className={`text-center py-8 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                No users found.
              </p>
            ) : (
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <th className="text-left py-3 px-2">
                      Name
                    </th>

                    <th className="text-left py-3 px-2">
                      Email
                    </th>

                    <th className="text-left py-3 px-2">
                      Role
                    </th>

                    <th className="text-left py-3 px-2">
                      Status
                    </th>

                    <th className="text-left py-3 px-2">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u) => {
                    const roleName =
                      getRoleName(u);

                    const isActive =
                      u?.is_active === true;

                    return (
                      <tr
                        key={u.id}
                        className={`border-b ${
                          darkMode
                            ? "border-gray-700 hover:bg-gray-700"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-4 px-2 font-medium">
                          {u.full_name || "—"}
                        </td>

                        <td className="py-4 px-2">
                          {u.email || "—"}
                        </td>

                        <td className="py-4 px-2 capitalize">
                          {roleName}
                        </td>

                        <td className="py-4 px-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              isActive
                                ? darkMode
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-700"
                                : darkMode
                                ? "bg-red-900 text-red-300"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="py-4 px-2 whitespace-nowrap">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditUser(u)
                            }
                            className={`hover:underline mr-3 ${
                              darkMode
                                ? "text-blue-400"
                                : "text-blue-600"
                            }`}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteUser(u)
                            }
                            disabled={
                              deletingId === u.id
                            }
                            className={`hover:underline disabled:text-gray-400 ${
                              darkMode
                                ? "text-red-400"
                                : "text-red-600"
                            }`}
                          >
                            {deletingId === u.id
                              ? "Deactivating..."
                              : "Delete"}
                          </button>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* ==========================================
          ADD / EDIT MODAL
          ========================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-5 sm:p-6 ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl sm:text-2xl font-bold">
                {editingUser
                  ? "Edit User"
                  : "Add User"}
              </h2>

              <button
                type="button"
                onClick={handleCloseModal}
                className={`text-2xl ${
                  darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NAME */}

              <div>
                <label className="block mb-2 font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="block mb-2 font-medium">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* PASSWORD - ADD ONLY */}

              {!editingUser && (
                <div>
                  <label className="block mb-2 font-medium">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  />

                  <p
                    className={`text-xs mt-1 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Minimum 8 characters.
                  </p>
                </div>
              )}

              {/* ROLE */}

             {/* ==========================================  ROLE ========================================== */}

                  <div>
                  <label className="block mb-2 font-medium">
                          Role
                        </label>

                             <select
                              name="role_name"
                              value={formData.role_name}
                              onChange={handleChange}
                              required
                              className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${
                                darkMode
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-gray-300"
                              }`}
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
              {/* ACTIVE - EDIT ONLY */}

              {editingUser && (
                <div
                  className={`flex items-center justify-between border rounded-lg p-3 ${
                    darkMode
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      Account Active
                    </p>

                    <p
                      className={`text-sm ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      Allow this user to access the workspace.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className={`px-5 py-2.5 rounded-lg border ${
                    darkMode
                      ? "border-gray-600 hover:bg-gray-700"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}