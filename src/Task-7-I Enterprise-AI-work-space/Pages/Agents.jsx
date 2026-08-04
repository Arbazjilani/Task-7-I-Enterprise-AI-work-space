import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { getAvailableAgents } from "../services/agent.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Agents() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { darkMode } = useTheme();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAvailableAgents();

        console.log("AGENTS DATA:", data);
        console.log("FIRST AGENT:", data?.[0]);

        setAgents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Error loading agents:",
          err.response?.data || err.message
        );

        setError("Failed to load agents.");
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  // Open selected agent in AI Chat
  const handleOpenAgent = (agent) => {
    console.log("SELECTED AGENT:", agent);

    navigate("/chat", {
      state: {
        selectedAgent: agent,
      },
    });
  };

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-3 sm:p-4 md:p-6">
          {/* Page Header */}
          <div
            className={`rounded-xl shadow-sm p-4 sm:p-6 mb-6 ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <h1 className="text-2xl sm:text-3xl font-bold">
              AI Agents
            </h1>

            <p
              className={`mt-2 text-sm sm:text-base ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Manage and interact with your enterprise AI agents.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-gray-400"
                  : "bg-white text-gray-500"
              }`}
            >
              Loading agents...
            </div>
          )}

          {/* Error */}
          {error && !loading && (
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

          {/* No Agents */}
          {!loading && !error && agents.length === 0 && (
            <div
              className={`rounded-xl shadow-sm p-6 ${
                darkMode
                  ? "bg-gray-800 text-gray-400"
                  : "bg-white text-gray-500"
              }`}
            >
              No agents available.
            </div>
          )}

          {/* Agents */}
          {!loading && !error && agents.length > 0 && (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-4
                md:gap-6
              "
            >
              {agents.map((agent) => {
                const isActive = agent?.is_enabled === true;

                return (
                  <div
                    key={agent.name}
                    className={`rounded-xl shadow-sm p-4 sm:p-6 transition hover:shadow-lg flex flex-col ${
                      darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    {/* Agent Name + Status */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold break-words">
                          {agent.display_name || agent.name}
                        </h2>

                        <p
                          className={`text-xs mt-1 capitalize ${
                            darkMode
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {agent.name}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                          isActive
                            ? darkMode
                              ? "bg-green-900 text-green-300"
                              : "bg-green-100 text-green-700"
                            : darkMode
                            ? "bg-red-900 text-red-300"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      className={`text-sm mt-4 leading-6 flex-grow ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {agent.description ||
                        "No description available."}
                    </p>

                    {/* Knowledge Domains */}
                    {Array.isArray(agent.knowledge_domains) &&
                      agent.knowledge_domains.length > 0 && (
                        <div className="mt-4">
                          <p
                            className={`text-xs mb-2 ${
                              darkMode
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Knowledge
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {agent.knowledge_domains.map(
                              (domain) => (
                                <span
                                  key={domain}
                                  className={`text-xs px-2 py-1 rounded-md capitalize ${
                                    darkMode
                                      ? "bg-gray-700 text-gray-300"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {domain}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Open Agent */}
                    <button
                      type="button"
                      onClick={() => handleOpenAgent(agent)}
                      disabled={!isActive}
                      className={`mt-6 w-full py-2.5 rounded-lg text-white transition ${
                        isActive
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-500 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {isActive
                        ? "Open Agent"
                        : "Agent Disabled"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}