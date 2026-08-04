import api from "./api";

export const getAvailableAgents = async () => {
  const response = await api.get("/api/agents");
  return response.data;
};
