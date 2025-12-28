"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ conversationId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // fetch old messages
  useEffect(() => {
    fetch(`/api/messages?conversationId=${conversationId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data || []));
  }, [conversationId]);

  useEffect(() => {
    socket.on("chat:message", (msg: any) => {
      if (msg.conversationId === conversationId)
        setMessages((p) => [...p, msg]);
    });
    return () => socket.off("chat:message");
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;

    socket.emit("chat:message", { conversationId, sender: "admin", text: input });
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {messages.map((m: any) => (
          <MessageBubble key={m.id} {...m} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2"
        />
        <button
          onClick={send}
          className="bg-blue-600 text-white px-4 py-2 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}
