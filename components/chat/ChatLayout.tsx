"use client";

import { useState, useEffect } from "react";
import { socket, updateSocketAuth } from "@/lib/socket";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { MessageSquare } from "lucide-react";

export default function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect socket with admin token
    updateSocketAuth();

    const handleConnect = () => {
      setIsConnected(true);
      console.log("Admin socket connected");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Admin socket disconnected");
    };

    const handleConnectError = (error: Error) => {
      console.error("Admin socket connection error:", error);
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Join admins room
    if (socket.connected) {
      socket.emit("admin:join");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <ConversationList onSelect={setActiveConversationId} />
      
      {activeConversationId ? (
        <ChatWindow conversationId={activeConversationId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={48} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No Conversation Selected
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {isConnected 
              ? "Select a conversation from the list to start chatting"
              : "Connecting to chat server..."
            }
          </p>
          {!isConnected && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}