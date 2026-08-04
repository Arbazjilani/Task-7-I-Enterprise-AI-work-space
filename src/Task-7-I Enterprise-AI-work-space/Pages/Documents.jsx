import { useEffect, useRef, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "../services/knowledge.js";

import { getUserById } from "../services/user.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Documents() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { darkMode } = useTheme();

  const [documents, setDocuments] = useState([]);
  const [uploaderNames, setUploaderNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);

  // ==========================================
  // LOAD UPLOADER NAMES
  // ==========================================

  const loadUploaderNames = async (docs) => {
    try {
      const uniqueUserIds = [
        ...new Set(
          docs
            .map((doc) => doc.uploaded_by_id)
            .filter((id) => id !== null && id !== undefined)
        ),
      ];

      const names = {};

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const uploader = await getUserById(userId);

            names[userId] =
              uploader.full_name ||
              uploader.email ||
              `User ${userId}`;
          } catch (err) {
            console.error(
              `Failed to load uploader ${userId}:`,
              err.response?.data || err.message
            );

            names[userId] = `User ${userId}`;
          }
        })
      );

      setUploaderNames(names);
    } catch (err) {
      console.error("Error loading uploader names:", err);
    }
  };

  // ==========================================
  // LOAD DOCUMENTS
  // ==========================================

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDocuments();

      console.log("DOCUMENTS:", data);

      const docs = Array.isArray(data) ? data : [];

      setDocuments(docs);

      await loadUploaderNames(docs);
    } catch (err) {
      console.error(
        "Error loading documents:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load documents."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DOCUMENTS WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    loadDocuments();
  }, []);

  // ==========================================
  // OPEN FILE INPUT
  // ==========================================

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ==========================================
  // UPLOAD DOCUMENT
  // ==========================================

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const response = await uploadDocument(file);

      console.log("UPLOAD RESPONSE:", response);

      // Reload latest documents from backend
      await loadDocuments();
    } catch (err) {
      console.error(
        "Error uploading document:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.detail ||
          "Failed to upload document."
      );
    } finally {
      setUploading(false);

      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // ==========================================
  // DELETE DOCUMENT
  // ==========================================

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Delete this document? This cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(documentId);
    setError("");

    try {
      const response = await deleteDocument(documentId);

      console.log("DELETE RESPONSE:", response);

      // Immediately remove deleted document from React UI
      setDocuments((previousDocuments) =>
        previousDocuments.filter(
          (document) => document.id !== documentId
        )
      );

      // IMPORTANT:
      // Fetch the latest documents from backend immediately.
      // No manual browser refresh is required.
      await loadDocuments();
    } catch (err) {
      console.error(
        "Error deleting document:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete document."
      );

      alert(
        err.response?.data?.detail ||
          "Failed to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (isoString) => {
    if (!isoString) return "—";

    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar user={user} />

        <main className="w-full p-3 sm:p-4 md:p-6">

          {/* ==========================================
              HEADER
          ========================================== */}

          <div
            className={`
              rounded-xl shadow-sm
              p-4 sm:p-5 md:p-6
              mb-5 md:mb-6
              flex flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
              ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-900"
              }
            `}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Documents
              </h1>

              <p
                className={`mt-2 text-sm sm:text-base ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Manage your knowledge base files.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
              />

              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                className="
                  w-full sm:w-auto
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-gray-400
                  disabled:cursor-not-allowed
                  text-white
                  px-5 py-3
                  rounded-lg
                  font-medium
                  transition
                "
              >
                {uploading
                  ? "Uploading..."
                  : "+ Upload Document"}
              </button>
            </div>
          </div>

          {/* ==========================================
              ERROR MESSAGE
          ========================================== */}

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

          {/* ==========================================
              DOCUMENTS TABLE
          ========================================== */}

          <div
            className={`rounded-xl shadow-sm p-4 sm:p-6 ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            {loading ? (
              <p
                className={`text-center py-8 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Loading documents...
              </p>
            ) : documents.length === 0 ? (
              <p
                className={`text-center py-8 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                No documents uploaded yet.
              </p>
            ) : (
              <div className="w-full overflow-x-auto">

                <table className="w-full min-w-[550px] border-collapse">

                  {/* TABLE HEADER */}

                  <thead>
                    <tr
                      className={`border-b ${
                        darkMode
                          ? "border-gray-700"
                          : "border-gray-200"
                      }`}
                    >
                      <th className="text-left px-3 py-3">
                        File Name
                      </th>

                      <th className="text-left px-3 py-3">
                        Uploaded By
                      </th>

                      <th className="text-left px-3 py-3">
                        Date
                      </th>

                      <th className="text-left px-3 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}

                  <tbody>
                    {documents.map((doc) => {
                      const fileName =
                        doc.original_filename ||
                        doc.filename ||
                        doc.file_name ||
                        doc.title ||
                        "Untitled";

                      const uploadedBy =
                        uploaderNames[doc.uploaded_by_id] ||
                        doc.uploader_name ||
                        doc.uploaded_by_name ||
                        "Loading...";

                      return (
                        <tr
                          key={doc.id}
                          className={`border-b transition ${
                            darkMode
                              ? "border-gray-700 hover:bg-gray-700/60"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {/* FILE NAME */}

                          <td className="px-3 py-4">
                            <div
                              className="max-w-[220px] truncate"
                              title={fileName}
                            >
                              {fileName}
                            </div>
                          </td>

                          {/* UPLOADED BY */}

                          <td className="px-3 py-4 whitespace-nowrap">
                            {uploadedBy}
                          </td>

                          {/* DATE */}

                          <td className="px-3 py-4 whitespace-nowrap">
                            {formatDate(doc.created_at)}
                          </td>

                          {/* DELETE ACTION */}

                          <td className="px-3 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(doc.id)
                              }
                              disabled={
                                deletingId === doc.id
                              }
                              className={`font-medium hover:underline disabled:text-gray-400 ${
                                darkMode
                                  ? "text-red-400"
                                  : "text-red-600"
                              }`}
                            >
                              {deletingId === doc.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}