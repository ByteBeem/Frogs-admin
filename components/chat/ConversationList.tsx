"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "@/lib/socket"; 
import { Users, Loader2, Search } from "lucide-react";

// Fallback if env variable isn't set, ensuring it works immediately
const API_URL = "https://api.blackfroglabs.co.za";

type Conversation = {
  id: string;
  name: string;
  visitorId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSender?: string;
  createdAt: string;
  status?: string;
  unreadCount: number;
};

interface ConversationListProps {
  onSelect: (id: string) => void;
}

export default function ConversationList({ onSelect }: ConversationListProps) {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const activeIdRef = useRef<string | null>(null);

  // Sync ref for socket callbacks to access current state
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // --- Sorting Logic ---
  // 1. Unread messages first
  // 2. Then newest messages
  const sortConversations = useCallback((conversations: Conversation[]) => {
    return [...conversations].sort((a, b) => {
      const unreadDiff = (b.unreadCount || 0) - (a.unreadCount || 0);
      if (unreadDiff !== 0) return unreadDiff;

      const timeA = new Date(a.lastMessageAt || a.createdAt).getTime();
      const timeB = new Date(b.lastMessageAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, []);

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        
        // Fetch conversations and unread counts in parallel
        const [convosRes, unreadRes] = await Promise.all([
          fetch(`${API_URL}/admin/conversations`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/unread-counts`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
        ]);

        if (!convosRes.ok) throw new Error("Failed to fetch conversations");

        const data: Conversation[] = await convosRes.json();
        
        let unreadCounts: Record<string, number> = {};
        if (unreadRes && unreadRes.ok) {
          unreadCounts = await unreadRes.json();
        }

        const enrichedData = data.map(c => ({
          ...c,
          lastMessageAt: c.lastMessageAt || c.createdAt,
          unreadCount: unreadCounts[c.id] || 0
        }));

        setConvos(sortConversations(enrichedData));

      } catch (error) {
        console.error("Error loading chat list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [sortConversations]);

  // --- Socket Event Handlers ---
  useEffect(() => {
    // 1. Handle New Messages (Update text & unread count)
    const handleMessage = (msg: any) => {
      setConvos(prev => {
        const updated = prev.map(c => {
          if (c.id === msg.conversationId) {
            // If message is from visitor AND we aren't looking at this chat, increment unread
            const isUnread = msg.sender === "visitor" && c.id !== activeIdRef.current;
            return {
              ...c,
              lastMessage: msg.text,
              lastMessageAt: msg.createdAt,
              lastMessageSender: msg.sender,
              unreadCount: isUnread ? (c.unreadCount || 0) + 1 : c.unreadCount
            };
          }
          return c;
        });
        return sortConversations(updated);
      });
    };

    // 2. Handle New Visitor Conversation
    const handleNewConversation = (newConvo: Conversation) => {
      setConvos(prev => {
        if (prev.some(c => c.id === newConvo.id)) return prev;
        const enriched = { ...newConvo, lastMessageAt: newConvo.createdAt, unreadCount: 1 };
        return sortConversations([enriched, ...prev]);
      });
    };

    // 3. Handle Mark as Read
    const handleRead = ({ conversationId }: { conversationId: string }) => {
      setConvos(prev => {
        const updated = prev.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
        return sortConversations(updated);
      });
    };

    // 4. Handle Bulk Unread Updates
    const handleUnreadCounts = (counts: Record<string, number>) => {
      setConvos(prev => {
        const updated = prev.map(c => ({ ...c, unreadCount: counts[c.id] || 0 }));
        return sortConversations(updated);
      });
    };

    socket.on("chat:message", handleMessage);
    socket.on("admin:new-conversation", handleNewConversation);
    socket.on("admin:conversation-read", handleRead);
    socket.on("admin:unread-counts", handleUnreadCounts);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("admin:new-conversation", handleNewConversation);
      socket.off("admin:conversation-read", handleRead);
      socket.off("admin:unread-counts", handleUnreadCounts);
    };
  }, [sortConversations]);

  // --- Select Conversation ---
  const handleSelect = useCallback((id: string) => {
    if (activeId && activeId !== id) {
      socket.emit("chat:leave", { conversationId: activeId });
    }

    setActiveId(id);
    onSelect(id);

    // Join room and mark read
    socket.emit("chat:join", { conversationId: id });
    socket.emit("chat:mark-read", { conversationId: id });

    // Optimistic update: clear unread count locally immediately
    setConvos(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, unreadCount: 0 } : c));
      return sortConversations(updated); 
    });
  }, [activeId, onSelect, sortConversations]);

  // --- Helpers ---
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
    
    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  return (
    <aside className="w-80 border-r bg-white flex flex-col h-full shadow-xl z-10">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-emerald-500 to-cyan-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg tracking-tight">Inbox</h2>
              <p className="text-xs text-white/90 font-medium">
                {convos.length} chats • {convos.reduce((a, b) => a + (b.unreadCount || 0), 0)} unread
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-0 bg-white/95 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm transition-shadow"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Loader2 size={24} className="animate-spin mb-2 text-emerald-500" />
            <span className="text-xs font-medium">Loading messages...</span>
          </div>
        ) : filteredConvos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-6">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Users size={32} className="opacity-20 text-slate-600" />
             </div>
            <p className="text-sm font-medium text-slate-600">No conversations found</p>
            <p className="text-xs mt-1">Waiting for visitors to start a chat...</p>
          </div>
        ) : (
          filteredConvos.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-all relative group
                ${activeId === c.id ? "bg-emerald-50/60" : ""}
              `}
            >
              {/* Active Stripe */}
              {activeId === c.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-cyan-500" />
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm
                  ${activeId === c.id ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white" : "bg-white text-slate-500 border border-slate-100 group-hover:border-emerald-200 transition-colors"}
                `}>
                  <Users size={18} />
                  {c.unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm animate-pulse">
                      {c.unreadCount > 9 ? "9+" : c.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${c.unreadCount > 0 ? "text-slate-900" : "text-slate-700"}`}>
                      {c.name}
                    </h3>
                    <span className={`text-[10px] shrink-0 ${c.unreadCount > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                      {formatTime(c.lastMessageAt)}
                    </span>
                  </div>
                  
                  <p className={`text-xs truncate ${c.unreadCount > 0 ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                    {c.lastMessageSender === "admin" && <span className="text-slate-400 font-normal">You: </span>}
                    {c.lastMessage || <span className="italic text-slate-400">No messages yet</span>}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
