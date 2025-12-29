"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { Users, Loader2, Search } from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  unread?: boolean;
};

interface ConversationListProps {
  onSelect: (id: string) => void;
}

export default function ConversationList({ onSelect }: ConversationListProps) {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [canPlaySound, setCanPlaySound] = useState(false);

  // Keep activeId in ref to fix closure issues
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio("/noty.wav");
    notificationSound.current.volume = 0.5;
  }, []);

  // Ask user for permission to play notifications
  useEffect(() => {
    const askPermission = () => {
      const play = () => {
        notificationSound.current?.play().catch(() => {});
      };

      window.addEventListener("click", () => {
        setCanPlaySound(true);
        play();
      }, { once: true });
    };

    askPermission();
  }, []);

  // Function to play notification sound
  const playNotification = () => {
    if (!canPlaySound) return;
    notificationSound.current?.play().catch(() => console.log("Audio play blocked"));
  };

  // Fetch initial conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/admin/conversations", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch conversations");

        const data: Conversation[] = await response.json();

        const sortedData = data
          .map(c => ({ ...c, lastMessageAt: c.lastMessageAt || c.createdAt }))
          .sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());

        setConvos(sortedData);

        if (sortedData.length > 0 && !activeId) {
          setActiveId(sortedData[0].id);
          onSelect(sortedData[0].id);
          socket.emit("chat:join", { conversationId: sortedData[0].id });
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [onSelect]);

  // Listen for new conversations & messages
  useEffect(() => {
    const handleNewConversation = (c: Conversation) => {
      setConvos(prev => {
        if (prev.some(conv => conv.id === c.id)) return prev;
        const newConv = { ...c, lastMessageAt: c.createdAt };
        const updated = [newConv, ...prev];

        return updated.sort((a, b) => {
          if ((b.unread ? 1 : 0) !== (a.unread ? 1 : 0)) return (b.unread ? 1 : 0) - (a.unread ? 1 : 0);
          return new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime();
        });
      });

      playNotification();

      if (!activeIdRef.current) {
        setActiveId(c.id);
        onSelect(c.id);
        socket.emit("chat:join", { conversationId: c.id });
      }
    };

    const handleMessage = (msg: any) => {
      setConvos(prev => {
        const updated = prev.map(c => {
          if (c.id === msg.conversationId) {
            return {
              ...c,
              lastMessage: msg.text,
              lastMessageAt: msg.createdAt,
              unread: msg.sender === "visitor" && c.id !== activeIdRef.current
            };
          }
          return c;
        });

        // Sort: unread first, then latest message
        return updated.sort((a, b) => {
          if ((b.unread ? 1 : 0) !== (a.unread ? 1 : 0)) return (b.unread ? 1 : 0) - (a.unread ? 1 : 0);
          return new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime();
        });
      });

      if (msg.conversationId !== activeIdRef.current && msg.sender === "visitor") {
        playNotification();
      }
    };

    socket.on("admin:new-conversation", handleNewConversation);
    socket.on("chat:message", handleMessage);

    return () => {
      socket.off("admin:new-conversation", handleNewConversation);
      socket.off("chat:message", handleMessage);
    };
  }, [onSelect]);

  const handleSelect = (id: string) => {
    if (activeId) {
      socket.emit("chat:leave", { conversationId: activeId });
    }

    setActiveId(id);
    onSelect(id);
    socket.emit("chat:join", { conversationId: id });

    // Mark as read
    setConvos(prev => prev.map(c => (c.id === id ? { ...c, unread: false } : c)));
  };

  const filteredConvos = convos.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <aside className="w-80 border-r bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-400 to-blue-500">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Conversations</h2>
            <p className="text-xs text-white/80">{convos.length} active chats</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-full border-0 bg-white/90 text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p className="text-sm">Loading conversations...</p>
          </div>
        )}

        {!loading && filteredConvos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">
              {searchTerm ? "No conversations found" : "No conversations yet"}
            </p>
            <p className="text-xs">
              {searchTerm ? "Try a different search term" : "Waiting for visitors to connect..."}
            </p>
          </div>
        )}

        {filteredConvos.map(c => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`w-full text-left p-4 border-b hover:bg-gray-50 flex items-start gap-3 transition-colors relative ${
              activeId === c.id ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              activeId === c.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <Users size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className={`font-medium text-sm truncate ${
                  activeId === c.id ? "text-blue-900" : "text-gray-900"
                }`}>
                  {c.name}
                </h3>
                {c.lastMessageAt && (
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {formatTime(c.lastMessageAt)}
                  </span>
                )}
              </div>

              {c.lastMessage && (
                <p className={`text-xs truncate ${
                  c.unread ? "text-gray-900 font-medium" : "text-gray-500"
                }`}>
                  {c.lastMessage}
                </p>
              )}
            </div>

            {c.unread && (
              <div className="absolute top-4 right-4">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
