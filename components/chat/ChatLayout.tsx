"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function ChatLayout() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    socket.auth = { token: localStorage.getItem("admin_token") };
    socket.connect();
    return () => socket.disconnect();
  }, []);

  return (
    <div className="flex h-screen border rounded-xl overflow-hidden">
      <ConversationList onSelect={setActiveId} />
      {activeId ? (
        <ChatWindow conversationId={activeId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
}
