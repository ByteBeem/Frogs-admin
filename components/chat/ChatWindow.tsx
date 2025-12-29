"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "@/lib/socket";
import { Send, Loader2, User } from "lucide-react";

type Message = {
  id: string;
  conversationId: string;
  sender: "admin" | "visitor";
  text: string;
  createdAt: string;
  pending?: boolean;
};

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load message history when conversation changes
  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    setMessages([]);
    setError(null);

    fetch(`http://localhost:3000/api/messages?conversationId=${conversationId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load messages");
        return r.json();
      })
      .then((data: Message[]) => {
        setMessages(data);
      })
      .catch((err) => {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conversationId]);

  // Socket listeners
  useEffect(() => {
    const handleMessage = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // Remove pending message if exists
          const filtered = prev.filter(m => !(m.pending && m.text === msg.text));
          return [...filtered, msg];
        });
      }
    };

    const handleTyping = ({ sender, isTyping: typing }: { sender: string; isTyping: boolean }) => {
      if (sender === "visitor") {
        setIsTyping(typing);
      }
    };

    const handleHistory = ({ messages: historyMessages }: { messages: Message[] }) => {
      setMessages(historyMessages);
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:history", handleHistory);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:history", handleHistory);
    };
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    socket.emit("chat:typing", { conversationId, isTyping: true });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", { conversationId, isTyping: false });
    }, 1000);
  }, [conversationId]);

  const send = useCallback(() => {
    if (!input.trim()) return;

    const messageText = input.trim();

    // Optimistically add message to UI
    const pendingMessage: Message = {
      id: `pending-${Date.now()}`,
      conversationId,
      sender: "admin",
      text: messageText,
      createdAt: new Date().toISOString(),
      pending: true
    };

    setMessages((prev) => [...prev, pendingMessage]);
    setInput("");

    // Send to server
    socket.emit("chat:message", { conversationId, text: messageText });

    // Stop typing indicator
    socket.emit("chat:typing", { conversationId, isTyping: false });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [input, conversationId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }, [send]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              Visitor #{conversationId.slice(0, 8)}
            </h2>
            {isTyping && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>Typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p className="text-sm">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <User size={32} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation by sending a message</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {date === new Date().toLocaleDateString() ? "Today" : date}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {msgs.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender === "admin" ? "justify-end" : "justify-start"
                      } animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          m.pending ? 'opacity-60' : 'opacity-100'
                        }`}
                      >
                        <div
                          className={`px-4 py-2.5 text-sm break-words shadow-sm ${
                            m.sender === "admin"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tl-2xl rounded-bl-2xl rounded-tr-md"
                              : "bg-white text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-tl-md border border-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                        <div
                          className={`text-xs mt-1 px-1 ${
                            m.sender === "admin" ? "text-right text-gray-500" : "text-left text-gray-400"
                          }`}
                        >
                          {formatTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-tr-2xl rounded-br-2xl rounded-tl-md shadow-sm border border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <footer className="border-t bg-white p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply..."
            className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600"
          >
            <Send size={18} />
            <span className="font-medium">Send</span>
          </button>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}