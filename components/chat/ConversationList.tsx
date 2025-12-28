"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type Conversation = {
  id: string;
  name: string;
  lastMessage?: string;
};

export default function ConversationList({ onSelect }: any) {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    socket.on("admin:new-conversation", (c: Conversation) => {
      setConvos((prev) => [c, ...prev]);
      if (!activeId) {
        setActiveId(c.id);
        onSelect(c.id);
      }
    });

    socket.on("chat:message", (msg: any) => {
      setConvos((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId ? { ...c, lastMessage: msg.text } : c
        )
      );
    });

    return () => {
      socket.off("admin:new-conversation");
      socket.off("chat:message");
    };
  }, [activeId, onSelect]);

  return (
    <aside className="w-72 md:w-80 border-r flex flex-col bg-white">
      <div className="p-4 font-bold text-lg border-b">Conversations</div>
      <div className="flex-1 overflow-y-auto">
        {convos.length === 0 && (
          <div className="text-gray-400 p-4 text-sm">
            Waiting for visitors...
          </div>
        )}
        {convos.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveId(c.id);
              socket.emit("chat:join", { conversationId: c.id });
              onSelect(c.id);
            }}
            className={`w-full flex flex-col p-3 border-b hover:bg-gray-100 transition ${
              activeId === c.id ? "bg-gray-100" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{c.name}</span>
            </div>
            {c.lastMessage && (
              <span className="text-xs text-gray-500 truncate">
                {c.lastMessage}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
