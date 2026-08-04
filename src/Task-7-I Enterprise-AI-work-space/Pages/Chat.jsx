import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import {
  getConversations,
  sendMessage,
} from "../services/chat.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Chat() {
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const { darkMode } = useTheme();

  // ==========================================
  // SELECTED AGENT
  // ==========================================

  // Agent passed from Agents.jsx
  const selectedAgent =
    location.state?.selectedAgent || null;

  // Sidebar Chat -> auto
  // Agents page -> general / hr / support /
  // project / documentation
  const agentName =
    selectedAgent?.name || "auto";

  const agentDisplayName =
    selectedAgent?.display_name ||
    "Enterprise AI";

  // ==========================================
  // STATES
  // ==========================================

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: selectedAgent
        ? `👋 You are now chatting with ${agentDisplayName}. How can I help you?`
        : "👋 Welcome to Enterprise AI Workspace. How can I help you today?",
    },
  ]);

  const [conversations, setConversations] =
    useState([]);

  const [input, setInput] = useState("");

  const [sending, setSending] =
    useState(false);

  // IMPORTANT:
  // Stores the current backend conversation ID.
  //
  // First message -> null
  // Backend creates conversation
  // Following messages reuse returned ID
  const [conversationId, setConversationId] =
    useState(null);

  const messagesEndRef = useRef(null);

  // ==========================================
  // LOAD CONVERSATIONS
  // ==========================================

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data =
          await getConversations();

        console.log(
          "CONVERSATIONS:",
          data
        );

        setConversations(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error loading conversations:",
          error.response?.data ||
            error.message
        );
      }
    };

    loadConversations();
  }, []);

  // ==========================================
  // DEBUG SELECTED AGENT
  // ==========================================

  useEffect(() => {
    console.log(
      "CHAT SELECTED AGENT:",
      selectedAgent
    );

    console.log(
      "CHAT AGENT NAME:",
      agentName
    );
  }, [selectedAgent, agentName]);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSend = async () => {
    const messageText = input.trim();

    if (!messageText || sending) {
      return;
    }

    // Add user's message immediately
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: messageText,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");
    setSending(true);

    try {
      console.log(
        "SENDING TO AGENT:",
        agentName
      );

      console.log(
        "CURRENT CONVERSATION ID:",
        conversationId
      );

      // ======================================
      // SEND MESSAGE TO BACKEND
      // ======================================

      const response =
        await sendMessage({
          message: messageText,

          // First message:
          // conversationId = null
          //
          // Following messages:
          // reuse backend conversation ID
          conversation_id: conversationId,

          // Selected AI agent
          agent_name: agentName,

          document_id: null,
        });

      console.log(
        "AI RESPONSE:",
        response
      );

      // ======================================
      // SAVE CONVERSATION ID
      // ======================================

      if (response?.conversation_id) {
        setConversationId(
          response.conversation_id
        );

        console.log(
          "ACTIVE CONVERSATION ID:",
          response.conversation_id
        );
      }

      // ======================================
      // EXTRACT AI RESPONSE TEXT
      // ======================================

      const replyText =
        typeof response === "string"
          ? response
          : response?.answer ||
            response?.message ||
            response?.reply ||
            response?.content ||
            response?.response ||
            "Sorry, I couldn't parse a response.";

      // ======================================
      // ADD AI MESSAGE
      // ======================================

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "Chat error:",
        error.response?.data ||
          error.message
      );

      const errorMessage =
        error.response?.data?.detail ||
        "Something went wrong reaching the AI assistant. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: `⚠️ ${errorMessage}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className={`flex min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gray-100"
      }`}
    >
      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">

        {/* NAVBAR */}
        <Navbar user={user} />

        <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 min-w-0">

          {/* ==================================
              HEADER
          ================================== */}

          <div
            className={`rounded-xl shadow-sm p-4 sm:p-5 mb-5 ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {selectedAgent
                    ? agentDisplayName
                    : "Enterprise AI Chat"}
                </h1>

                <p
                  className={`mt-1 text-sm sm:text-base ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {selectedAgent
                    ? selectedAgent.description ||
                      "Chat with your selected AI agent."
                    : "Chat with your AI assistant."}
                </p>
              </div>

              {/* SELECTED AGENT BADGE */}

              {selectedAgent && (
                <div className="self-start sm:self-auto">
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${
                      darkMode
                        ? "bg-green-900 text-green-300"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Active Agent:{" "}
                    {selectedAgent.name}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* ==================================
              CHAT AREA
          ================================== */}

          <div
            className={`flex-1 rounded-xl shadow-sm p-3 sm:p-4 md:p-6 overflow-y-auto min-h-[350px] ${
              darkMode
                ? "bg-gray-800"
                : "bg-white"
            }`}
          >
            <div className="space-y-5">

              {/* MESSAGES */}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] md:max-w-xl px-4 sm:px-5 py-3 rounded-xl break-words ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : darkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {/* THINKING MESSAGE */}

              {sending && (
                <div className="flex justify-start">
                  <div
                    className={`max-w-[85%] sm:max-w-xl px-5 py-3 rounded-xl italic ${
                      darkMode
                        ? "bg-gray-700 text-gray-400"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {selectedAgent
                      ? `${agentDisplayName} is thinking...`
                      : "Thinking..."}
                  </div>
                </div>
              )}

              {/* AUTO SCROLL TARGET */}

              <div ref={messagesEndRef} />

            </div>
          </div>

          {/* ==================================
              INPUT AREA
          ================================== */}

          <div
            className={`rounded-xl shadow-sm p-3 sm:p-4 mt-5 flex flex-col sm:flex-row gap-3 ${
              darkMode
                ? "bg-gray-800"
                : "bg-white"
            }`}
          >

            <input
              type="text"
              placeholder={
                selectedAgent
                  ? `Ask ${agentDisplayName}...`
                  : "Type your message..."
              }
              className={`flex-1 min-w-0 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !sending
                ) {
                  handleSend();
                }
              }}
              disabled={sending}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={
                sending ||
                !input.trim()
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition sm:w-auto w-full"
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}