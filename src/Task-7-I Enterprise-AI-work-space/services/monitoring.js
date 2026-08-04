import api from "./api";

// Workspace overview
export const getUsageSummary = async () => {
  try {
    const response = await api.get("/api/analytics/overview");

    console.log("ANALYTICS OVERVIEW RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Analytics Overview Error:",
      error.response?.data || error.message,
    );
    return {};
  }
};

// Token analytics
export const getTokenUsage = async () => {
  const response = await api.get("/api/analytics/tokens");

  return response.data;
};

// API analytics
export const getApiUsage = async () => {
  const response = await api.get("/api/analytics/apis");
  console.log("API USAGE RESPONSE:", response.data);
  return response.data;
};

// Agent analytics
export const getAgentUsage = async () => {
  const response = await api.get("/api/analytics/agents");
  return response.data;
};
