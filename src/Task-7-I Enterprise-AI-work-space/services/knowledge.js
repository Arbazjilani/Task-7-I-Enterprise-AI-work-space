import api from "./api";

// Get all documents
export const getDocuments = async () => {
  const response = await api.get("/api/documents");

  console.log("DOCUMENTS RESPONSE:", response.data);

  return response.data;
};

// Upload document
export const uploadDocument = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Delete document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/api/documents/${documentId}`);

  return response.data;
};
