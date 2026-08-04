import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../Components/Sidebar.jsx";
import Navbar from "../Components/Navbar.jsx";

import { getProfile } from "../services/auth.js";
import { getDocuments } from "../services/knowledge.js";
import { getAvailableAgents } from "../services/agent.js";
import { getConversations } from "../services/chat.js";
import { getUsageSummary } from "../services/monitoring.js";

import { useTheme } from "../context/ThemeContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      try {
        // ================= PROFILE =================

        try {
          const userProfile = await getProfile();

          console.log("PROFILE:", userProfile);

          setProfile(userProfile || {});
        } catch (err) {
          console.error(
            "Profile Error:",
            err.response?.data || err.message
          );

          setProfile({});
        }

        // ================= DOCUMENTS =================

        try {
          const docs = await getDocuments();

          console.log("DOCUMENTS:", docs);

          setDocuments(
            Array.isArray(docs) ? docs : []
          );
        } catch (err) {
          console.error(
            "Documents Error:",
            err.response?.data || err.message
          );

          setDocuments([]);
        }

        // ================= AGENTS =================

        try {
          const agentData =
            await getAvailableAgents();

          console.log("AGENTS:", agentData);

          setAgents(
            Array.isArray(agentData)
              ? agentData
              : []
          );
        } catch (err) {
          console.error(
            "Agents Error:",
            err.response?.data || err.message
          );

          setAgents([]);
        }

        // ================= CONVERSATIONS =================

        try {
          const chats =
            await getConversations();

          console.log("CHATS:", chats);

          setConversations(
            Array.isArray(chats)
              ? chats
              : []
          );
        } catch (err) {
          console.error(
            "Chat Error:",
            err.response?.data || err.message
          );

          setConversations([]);
        }

        // ================= USAGE =================

        try {
          const usageSummary =
            await getUsageSummary();

          console.log(
            "USAGE:",
            usageSummary
          );

          setUsage(
            usageSummary || {}
          );
        } catch (err) {
          console.error(
            "Usage Error:",
            err.response?.data || err.message
          );

          setUsage({});
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================================================
  // GET CURRENT USER ROLE
  // =========================================================

  const role =
    profile?.role?.name?.toLowerCase() ||
    profile?.role_name?.toLowerCase() ||
    (typeof profile?.role === "string"
      ? profile.role.toLowerCase()
      : "employee");

  // =========================================================
  // ROLE PERMISSIONS
  // =========================================================

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isEmployee = role === "employee";

  // Backend:
  // Manager + Admin have analytics:read
  const canViewAnalytics =
    isAdmin || isManager;

  console.log(
    "DASHBOARD ROLE:",
    role
  );

  console.log(
    "CAN VIEW ANALYTICS:",
    canViewAnalytics
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen text-xl font-semibold ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        Loading Dashboard...
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div
      className={`min-h-screen flex ${
        darkMode
          ? "bg-gray-900"
          : "bg-gray-100"
      }`}
    >
      {/* ================= SIDEBAR ================= */}

      <Sidebar />

      <div className="flex-1">

        {/* ================= NAVBAR ================= */}

        <Navbar user={profile} />

        <main className="p-8">

          {/* ================= WELCOME ================= */}

          <div className="mb-8">

            <h1
              className={`text-3xl font-bold ${
                darkMode
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              Welcome,{" "}
              {profile?.full_name || "User"} 👋
            </h1>

            <p
              className={`mt-2 ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Manage your AI workspace from one place.
            </p>

          </div>

          {/* =================================================
              DASHBOARD STAT CARDS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* DOCUMENTS */}

            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white"
              }`}
            >
              <p
                className={
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                Documents
              </p>

              <h2 className="text-3xl font-bold mt-3">
                {documents.length}
              </h2>

              <p
                className={`text-sm mt-2 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Knowledge base files
              </p>
            </div>

            {/* AI AGENTS */}

            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white"
              }`}
            >
              <p
                className={
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                AI Agents
              </p>

              <h2 className="text-3xl font-bold mt-3">
                {agents.length}
              </h2>

              <p
                className={`text-sm mt-2 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Available agents
              </p>
            </div>

            {/* CONVERSATIONS */}

            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white"
              }`}
            >
              <p
                className={
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                Conversations
              </p>

              <h2 className="text-3xl font-bold mt-3">
                {conversations.length}
              </h2>

              <p
                className={`text-sm mt-2 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                AI conversations
              </p>
            </div>

            {/* TOKEN USAGE */}

            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white"
              }`}
            >
              <p
                className={
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                Token Usage
              </p>

              <h2 className="text-3xl font-bold mt-3">
                {usage?.total_tokens?.toLocaleString?.() ??
                  0}
              </h2>

              <p
                className={`text-sm mt-2 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Tokens consumed
              </p>
            </div>

          </div>

          {/* =================================================
              LOWER DASHBOARD
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white"
              }`}
            >

              <h2 className="text-xl font-bold">
                Quick Actions
              </h2>

              <p
                className={`text-sm mt-1 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Access common workspace features.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

                {/* ================= AI CHAT ================= */}

                <button
                  onClick={() =>
                    navigate("/chat")
                  }
                  className={`border rounded-xl p-5 text-left transition ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold">
                    New AI Chat
                  </p>

                  <p
                    className={`text-sm mt-1 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Ask the AI assistant
                  </p>
                </button>

                {/* ================= DOCUMENTS ================= */}

                <button
                  onClick={() =>
                    navigate("/documents")
                  }
                  className={`border rounded-xl p-5 text-left transition ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold">
                    Upload Document
                  </p>

                  <p
                    className={`text-sm mt-1 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Add to knowledge base
                  </p>
                </button>

                {/* ================= AI AGENTS ================= */}

                <button
                  onClick={() =>
                    navigate("/agents")
                  }
                  className={`border rounded-xl p-5 text-left transition ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold">
                    AI Agents
                  </p>

                  <p
                    className={`text-sm mt-1 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Open available agents
                  </p>
                </button>

                {/* =================================================
                    ANALYTICS

                    ADMIN   -> SHOW
                    MANAGER -> SHOW
                    EMPLOYEE -> HIDE
                ================================================= */}

                {canViewAnalytics && (
                  <button
                    onClick={() =>
                      navigate("/analytics")
                    }
                    className={`border rounded-xl p-5 text-left transition ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-semibold">
                      Analytics
                    </p>

                    <p
                      className={`text-sm mt-1 ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      View workspace usage
                    </p>
                  </button>
                )}

              </div>
            </div>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white"
              }`}
            >

              <h2 className="text-xl font-bold">
                Account Information
              </h2>

              <div className="mt-6 space-y-5">

                {/* FULL NAME */}

                <div>
                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Full Name
                  </p>

                  <p className="font-semibold mt-1">
                    {profile?.full_name ||
                      "Not Available"}
                  </p>
                </div>

                {/* EMAIL */}

                <div>
                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Email
                  </p>

                  <p className="font-semibold mt-1">
                    {profile?.email ||
                      "Not Available"}
                  </p>
                </div>

                {/* DEPARTMENT */}

                

                {/* ROLE */}

                <div>
                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Role
                  </p>

                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm capitalize ${
                      darkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {role}
                  </span>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}