import api from "./api.js";

// ===============================
// GET ALL USERS
// GET /api/users
// ===============================
export const getUsers = async () => {
  const response = await api.get("/api/users");
  return response.data;
};

// ===============================
// GET ONE USER BY ID
// GET /api/users/{user_id}
// ===============================
export const getUserById = async (userId) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

// ===============================
// CREATE USER
// POST /api/users
// ===============================
export const createUser = async (userData) => {
  const response = await api.post("/api/users", userData);
  return response.data;
};

// ===============================
// UPDATE USER
// PUT /api/users/{user_id}
// ===============================
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/api/users/${userId}`, userData);

  return response.data;
};

// ===============================
// DELETE / DEACTIVATE USER
// DELETE /api/users/{user_id}
// ===============================
export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/users/${userId}`);

  return response.data;
};
