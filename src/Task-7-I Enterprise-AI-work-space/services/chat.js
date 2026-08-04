import api from "./api";

// Get all conversations
export const getConversations = async () => {
  const response = await api.get("/api/conversations");
  console.log("CONVERSATIONS RESPONSE:", response.data);
  return response.data;
};

// Send message to AI
export const sendMessage = async (data) => {
  const response = await api.post("/api/chat", data);
  return response.data;
};

// Get one conversation
export const getConversation = async (conversationId) => {
  const response = await api.get(`/api/conversations/${conversationId}`);
  return response.data;
};

// Delete conversation
export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/api/conversations/${conversationId}`);
  return response.data;
};
