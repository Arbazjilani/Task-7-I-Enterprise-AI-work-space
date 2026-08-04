import api from "./api";

export const getOverview = async () => {
  const response = await api.get("/api/admin/overview");
  return response.data;
};
