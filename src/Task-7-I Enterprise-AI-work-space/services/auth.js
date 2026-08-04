import api from "./api";

// Register
export const register = async (userData) => {
  const response = await api.post("/api/auth/register", userData);
  return response.data;
};

// Login
export const login = async (email, password) => {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/api/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

// Get Profile
export const getProfile = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

// Alias for old pages
export const getCurrentUserProfile = getProfile;

// Update Profile
export const updateProfile = async (id, data) => {
  const response = await api.put(`/api/users/${id}`, data);
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};
