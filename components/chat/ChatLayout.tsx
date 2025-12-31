"use client";

import { useState, useEffect } from "react";
import { socket, updateSocketAuth } from "@/lib/socket";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { MessageSquare, AlertCircle } from "lucide-react";

export default function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Connect socket with admin token
    updateSocketAuth();

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      setRetryCount(0);
      console.log("Admin socket connected");
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log("Admin socket disconnected:", reason);
      
      if (reason === "io server disconnect") {
        // Server disconnected the socket, need to reconnect manually
        setConnectionError("Server disconnected. Attempting to reconnect...");
        setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    };

    const handleConnectError = (error: Error) => {
      console.error("Admin socket connection error:", error);
      setIsConnected(false);
      setConnectionError(error.message || "Connection failed");
      setRetryCount(prev => prev + 1);
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      setConnectionError(`Reconnecting... (attempt ${attemptNumber})`);
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setConnectionError(null);
      setRetryCount(0);
    };

    // Socket event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleReconnect);

    // Set initial connection state
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleReconnect);
    };
  }, []);

  // Manual reconnect function
  const handleManualReconnect = () => {
    setConnectionError("Reconnecting...");
    socket.connect();
  };

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <ConversationList onSelect={setActiveConversationId} />

      {activeConversationId ? (
        <ChatWindow conversationId={activeConversationId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
          {/* Connection error banner */}
          {connectionError && (
            <div className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-200 p-3">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{connectionError}</span>
                {retryCount > 3 && (
                  <button
                    onClick={handleManualReconnect}
                    className="ml-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Retry Now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={48} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No Conversation Selected
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {isConnected
              ? "Select a conversation from the list to start chatting"
              : "Connecting to chat server..."}
          </p>
          {!isConnected && !connectionError && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}