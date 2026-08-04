import { useEffect, useState } from "react";

import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

import { getDocuments } from "../services/knowledge.js";
import { getAvailableAgents } from "../services/agent.js";
import { getConversations } from "../services/chat.js";

import {
  getUsageSummary,
  getTokenUsage,
  getApiUsage,
} from "../services/monitoring.js";

import { useTheme } from "../context/ThemeContext.jsx";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import { getUserById } from "../services/user.js";




export default function Analytics() {
  // =====================================================
  // LOGGED-IN USER
  // =====================================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid stored user:", error);
  }

  const { darkMode } = useTheme();

  // =====================================================
  // STATE
  // =====================================================

  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [tokenUsage, setTokenUsage] = useState([]);
  const [apiUsage, setApiUsage] = useState([]);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // -------------------------------------------------
        // TOKEN USAGE
        // -------------------------------------------------

        const tokenData = await getTokenUsage();

        console.log("TOKEN USAGE DATA:", tokenData);

        setTokenUsage(
          Array.isArray(tokenData) ? tokenData : []
        );

        // -------------------------------------------------
        // API USAGE
        // -------------------------------------------------

        const apiData = await getApiUsage();

        console.log("API USAGE DATA:", apiData);

        const topApis = Array.isArray(apiData)
          ? [...apiData]
              .sort(
                (a, b) =>
                  Number(b.request_count || 0) -
                  Number(a.request_count || 0)
              )
              .slice(0, 8)
          : [];

        setApiUsage(topApis);

        // -------------------------------------------------
        // DOCUMENTS + AGENTS + CONVERSATIONS + OVERVIEW
        // -------------------------------------------------

        const [
          documents,
          agents,
          conversations,
          usage,
        ] = await Promise.all([
          getDocuments(),
          getAvailableAgents(),
          getConversations(),
          getUsageSummary().catch(() => null),
        ]);

        console.log("DOCUMENTS:", documents);
        console.log("AGENTS:", agents);
        console.log("CONVERSATIONS:", conversations);
        console.log("USAGE SUMMARY:", usage);

        // -------------------------------------------------
        // MAKE SURE RESPONSES ARE ARRAYS
        // -------------------------------------------------

        const documentList = Array.isArray(documents)
          ? documents
          : [];

        const agentList = Array.isArray(agents)
          ? agents
          : [];

        const conversationList = Array.isArray(conversations)
          ? conversations
          : [];

        // =================================================
        // STAT CARDS
        // =================================================

        setStats([
          {
            title: "Total Messages",

            value:
              usage?.total_messages?.toLocaleString?.() ??
              "0",

            color: "bg-blue-500",
          },

          {
            title: "Token Usage",

            value:
              usage?.total_tokens?.toLocaleString?.() ??
              "0",

            color: "bg-green-500",
          },

          {
            title: "Total Users",

            value:
              usage?.total_users?.toLocaleString?.() ??
              "0",

            color: "bg-purple-500",
          },

          {
            title: "AI Agents",

            value:
              usage?.total_agents?.toLocaleString?.() ??
              agentList.length.toString(),

            color: "bg-orange-500",
          },
        ]);

        // =================================================
        // RECENT ACTIVITY
        // =================================================

        const chatActivities = conversationList.map((c) => ({
          id: `chat-${c.id}`,

          type: "AI Chat",

          user:
            c.user_name ||
            c.user?.username ||
            c.user?.full_name ||
            user?.username ||
            user?.full_name ||
            "Unknown",

          action: c.title
            ? `Chatted: ${c.title}`
            : "Started AI Chat",

          time:
            c.updated_at ||
            c.created_at ||
            null,
        }));

      const documentActivities = await Promise.all(
  documentList.map(async (d) => {
    let uploaderName = "Unknown";

    try {
      // The document API returns uploaded_by_id.
      // Use that ID to get the actual uploader.
      if (d.uploaded_by_id) {
        const uploader = await getUserById(d.uploaded_by_id);

        console.log(
          `DOCUMENT ${d.id} UPLOADER:`,
          uploader
        );

        uploaderName =
          uploader?.full_name ||
          uploader?.email ||
          `User ${d.uploaded_by_id}`;
      } else {
        // Keep support in case backend later returns
        // uploader information directly.
        uploaderName =
          d.user_name ||
          d.user?.username ||
          d.user?.full_name ||
          d.uploaded_by_name ||
          "Unknown";
      }
    } catch (error) {
      console.error(
        `Failed to load uploader for document ${d.id}:`,
        error.response?.data || error.message
      );

      uploaderName =
        d.user_name ||
        d.user?.username ||
        d.user?.full_name ||
        d.uploaded_by_name ||
        `User ${d.uploaded_by_id || "Unknown"}`;
    }

    return {
      id: `document-${d.id}`,

      type: "Document",

      user: uploaderName,

      action: `Uploaded ${
        d.original_filename ||
        d.filename ||
        d.title ||
        "Document"
      }`,

      time:
        d.updated_at ||
        d.created_at ||
        null,
    };
  })
);
        // -------------------------------------------------
        // MERGE + SORT
        // -------------------------------------------------

        const activity = [
          ...chatActivities,
          ...documentActivities,
        ]
          .filter((item) => item.time)
          .sort(
            (a, b) =>
              new Date(b.time).getTime() -
              new Date(a.time).getTime()
          )
          .slice(0, 10);

        console.log("RECENT ACTIVITY:", activity);

        setRecentActivity(activity);
      } catch (error) {
        console.error(
          "Analytics Error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // =====================================================
  // FORMAT ACTIVITY TIME
  // =====================================================

  const formatTime = (isoString) => {
    if (!isoString) {
      return "—";
    }

    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const diffMs = Date.now() - date.getTime();

    // Future timestamp protection
    if (diffMs < 0) {
      return date.toLocaleString();
    }

    const mins = Math.floor(diffMs / 60000);

    if (mins < 1) {
      return "just now";
    }

    if (mins < 60) {
      return `${mins} min${mins === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(mins / 60);

    if (hours < 24) {
      return `${hours} hr${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return date.toLocaleDateString();
  };

  // =====================================================
  // FORMAT TOKEN CHART DATE
  // =====================================================

  const formatChartDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    // Adding local midnight prevents UTC date shifting
    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  // =====================================================
  // FORMAT API ENDPOINT
  // =====================================================

  const formatEndpoint = (endpoint) => {
    if (!endpoint) {
      return "";
    }

    if (endpoint.length > 22) {
      return `${endpoint.substring(0, 20)}...`;
    }

    return endpoint;
  };

  // =====================================================
  // TYPE BADGE STYLE
  // =====================================================

  const getTypeBadgeClass = (type) => {
    if (type === "AI Chat") {
      return darkMode
        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
        : "bg-blue-100 text-blue-700 border border-blue-200";
    }

    if (type === "Document") {
      return darkMode
        ? "bg-green-500/20 text-green-300 border border-green-500/30"
        : "bg-green-100 text-green-700 border border-green-200";
    }

    return darkMode
      ? "bg-gray-700 text-gray-300"
      : "bg-gray-100 text-gray-700";
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div
      className={`flex min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gray-100"
      }`}
    >
      {/* =================================================
          SIDEBAR
      ================================================== */}

      <Sidebar />

      {/* =================================================
          PAGE CONTENT
      ================================================== */}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-4 sm:p-6">

          {/* =================================================
              ANALYTICS HEADER
          ================================================== */}

          <div
            className={`rounded-xl shadow-sm p-5 sm:p-6 mb-6 ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <h1 className="text-2xl sm:text-3xl font-bold">
              Analytics Dashboard
            </h1>

            <p
              className={`mt-2 ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Monitor AI usage, users, tokens and workspace
              activity.
            </p>
          </div>

          {/* =================================================
              STAT CARDS
          ================================================== */}

          {loading ? (
            <div
              className={`rounded-xl shadow-sm p-6 mb-6 ${
                darkMode
                  ? "bg-gray-800 text-gray-400"
                  : "bg-white text-gray-500"
              }`}
            >
              Loading stats...
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-4
                sm:gap-6
                mb-6
              "
            >
              {stats.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-xl shadow-sm p-5 sm:p-6 ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg ${item.color}`}
                  />

                  <h2 className="text-3xl font-bold mt-5">
                    {item.value}
                  </h2>

                  <p
                    className={`mt-2 ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* =================================================
              CHART SECTION
          ================================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* =================================================
                TOKEN USAGE
            ================================================== */}

            <div
              className={`rounded-xl shadow-sm p-4 sm:p-6 min-w-0 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              <h2 className="text-xl font-semibold">
                Token Usage
              </h2>

              <p
                className={`text-sm mt-1 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Daily prompt, completion and total token usage.
              </p>

              <div className="mt-6 h-72 w-full min-w-0">
                {loading ? (
                  <div
                    className={`h-full flex items-center justify-center ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Loading token usage...
                  </div>
                ) : tokenUsage.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={tokenUsage}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 5,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={
                          darkMode
                            ? "#4b5563"
                            : "#e5e7eb"
                        }
                      />

                      <XAxis
                        dataKey="date"
                        tickFormatter={formatChartDate}
                        tick={{
                          fill: darkMode
                            ? "#d1d5db"
                            : "#4b5563",
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        tick={{
                          fill: darkMode
                            ? "#d1d5db"
                            : "#4b5563",
                          fontSize: 12,
                        }}
                      />

                      <Tooltip
                        labelFormatter={(value) =>
                          `Date: ${formatChartDate(value)}`
                        }
                        formatter={(value, name) => [
                          Number(value || 0).toLocaleString(),
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: darkMode
                            ? "#1f2937"
                            : "#ffffff",

                          borderColor: darkMode
                            ? "#4b5563"
                            : "#e5e7eb",

                          color: darkMode
                            ? "#ffffff"
                            : "#111827",
                        }}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="prompt_tokens"
                        name="Prompt Tokens"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="completion_tokens"
                        name="Completion Tokens"
                        stroke="#22c55e"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="total_tokens"
                        name="Total Tokens"
                        stroke="#a855f7"
                        strokeWidth={3}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className={`h-full flex items-center justify-center border-2 border-dashed rounded-xl ${
                      darkMode
                        ? "border-gray-600 text-gray-500"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    No token usage data available.
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                API REQUESTS
            ================================================== */}

            <div
              className={`rounded-xl shadow-sm p-4 sm:p-6 min-w-0 ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              <h2 className="text-xl font-semibold">
                API Requests
              </h2>

              <p
                className={`text-sm mt-1 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Top API endpoints by request count.
              </p>

              <div className="mt-6 h-72 w-full min-w-0">
                {loading ? (
                  <div
                    className={`h-full flex items-center justify-center ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Loading API usage...
                  </div>
                ) : apiUsage.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={apiUsage}
                      margin={{
                        top: 10,
                        right: 15,
                        left: 0,
                        bottom: 55,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={
                          darkMode
                            ? "#4b5563"
                            : "#e5e7eb"
                        }
                      />

                      <XAxis
                        dataKey="endpoint"
                        tickFormatter={formatEndpoint}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={80}
                        tick={{
                          fill: darkMode
                            ? "#d1d5db"
                            : "#4b5563",
                          fontSize: 10,
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: darkMode
                            ? "#d1d5db"
                            : "#4b5563",
                          fontSize: 12,
                        }}
                      />

                      <Tooltip
                        formatter={(value, name) => [
                          Number(value || 0).toLocaleString(),
                          name,
                        ]}
                        labelFormatter={(endpoint) =>
                          `Endpoint: ${endpoint}`
                        }
                        contentStyle={{
                          backgroundColor: darkMode
                            ? "#1f2937"
                            : "#ffffff",

                          borderColor: darkMode
                            ? "#4b5563"
                            : "#e5e7eb",

                          color: darkMode
                            ? "#ffffff"
                            : "#111827",
                        }}
                      />

                      <Legend />

                      <Bar
                        dataKey="request_count"
                        name="Requests"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="error_count"
                        name="Errors"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className={`h-full flex items-center justify-center border-2 border-dashed rounded-xl ${
                      darkMode
                        ? "border-gray-600 text-gray-500"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    No API usage data available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              RECENT ACTIVITY
          ================================================== */}

          <div
            className={`rounded-xl shadow-sm p-4 sm:p-6 mt-6 ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Recent Activity
                </h2>

                <p
                  className={`text-sm mt-1 ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Latest AI chat and document activity.
                </p>
              </div>
            </div>

            {/* =================================================
                ACTIVITY TABLE
            ================================================== */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <th className="text-left py-3 px-2">
                      User
                    </th>

                    <th className="text-left py-3 px-2">
                      Type
                    </th>

                    <th className="text-left py-3 px-2">
                      Action
                    </th>

                    <th className="text-left py-3 px-2">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className={`py-8 text-center ${
                          darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Loading activity...
                      </td>
                    </tr>
                  ) : recentActivity.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className={`py-8 text-center ${
                          darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        No recent activity.
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map(
                      (activity, index) => (
                        <tr
                          key={
                            activity.id ||
                            `${activity.type}-${index}`
                          }
                          className={`border-b last:border-b-0 transition-colors ${
                            darkMode
                              ? "border-gray-700 hover:bg-gray-700/40"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {/* USER */}

                          <td className="py-4 px-2 font-medium">
                            {activity.user}
                          </td>

                          {/* TYPE */}

                          <td className="py-4 px-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getTypeBadgeClass(
                                activity.type
                              )}`}
                            >
                              {activity.type}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td className="py-4 px-2">
                            {activity.action}
                          </td>

                          {/* TIME */}

                          <td className="py-4 px-2 whitespace-nowrap">
                            {formatTime(activity.time)}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}