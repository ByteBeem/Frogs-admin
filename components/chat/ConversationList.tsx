"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "@/lib/socket";
import { Users, Loader2, Search, Bell, BellOff, Volume2, VolumeX } from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  visitorId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSender?: string;
  createdAt: string;
  status?: string;
  unreadCount?: number;
};

interface ConversationListProps {
  onSelect: (id: string) => void;
}

export default function ConversationList({ onSelect }: ConversationListProps) {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false); // Show activation status
  
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const activeIdRef = useRef<string | null>(null);

  // Keep activeId in sync with ref
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio("/noty.wav");
    notificationSound.current.volume = 0.5;

    // Enable sound on first user interaction
    const enableSound = () => {
      console.log("[Admin] Enabling notification sound...");
      
      // Test play to activate audio context
      notificationSound.current?.play()
        .then(() => {
          console.log("[Admin] ✅ Sound enabled!");
          notificationSound.current?.pause();
          if (notificationSound.current) {
            notificationSound.current.currentTime = 0;
          }
          setSoundEnabled(true);
        })
        .catch((err) => {
          console.error("[Admin] ❌ Sound activation failed:", err);
          setSoundEnabled(false);
        });
    };

    // Try multiple events to catch user interaction
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, enableSound, { once: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, enableSound);
      });
    };
  }, []);

  // Request notification permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("[Admin] Notification permission:", permission);
      });
    }
  }, []);

  // Play notification sound
  const playNotification = useCallback(() => {
    if (!notificationsEnabled || !soundEnabled) {
      console.log("[Admin] Sound not played:", { notificationsEnabled, soundEnabled });
      return;
    }
    
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play()
        .then(() => console.log("[Admin] 🔔 Sound played"))
        .catch((err) => {
          console.error("[Admin] Sound play error:", err);
          // Try to re-enable
          setSoundEnabled(false);
        });
    }
  }, [notificationsEnabled, soundEnabled]);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string, conversationId: string) => {
    if (!notificationsEnabled) return;
    
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/chat-icon.png",
        badge: "/chat-icon.png",
        tag: conversationId,
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Select the conversation
        if (conversationId) {
          handleSelect(conversationId);
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, [notificationsEnabled]);

  // Calculate total unread count
  useEffect(() => {
    const total = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    setTotalUnread(total);

    // Update page title with unread count
    if (total > 0) {
      document.title = `(${total}) Admin Chat`;
    } else {
      document.title = "Admin Chat";
    }
  }, [convos]);

  // Fetch initial conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/admin/conversations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch conversations");

        const data: Conversation[] = await response.json();

        // Get unread counts
        const unreadResponse = await fetch("http://localhost:3000/api/unread-counts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`
          }
        }).catch(() => null);

        let unreadCounts: { [key: string]: number } = {};
        if (unreadResponse && unreadResponse.ok) {
          unreadCounts = await unreadResponse.json();
        }

        const enrichedData = data.map(c => ({
          ...c,
          lastMessageAt: c.lastMessageAt || c.createdAt,
          unreadCount: unreadCounts[c.id] || 0
        }));

        const sortedData = sortConversations(enrichedData);
        setConvos(sortedData);

        // Auto-select first conversation if none selected
        if (sortedData.length > 0 && !activeId) {
          const firstConvo = sortedData[0];
          setActiveId(firstConvo.id);
          onSelect(firstConvo.id);
          socket.emit("chat:join", { conversationId: firstConvo.id });
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Sort conversations: unread first, then by latest message time
  const sortConversations = useCallback((conversations: Conversation[]) => {
    return [...conversations].sort((a, b) => {
      // Sort by unread count first
      const unreadDiff = (b.unreadCount || 0) - (a.unreadCount || 0);
      if (unreadDiff !== 0) return unreadDiff;

      // Then by latest message time
      const timeA = new Date(a.lastMessageAt || a.createdAt).getTime();
      const timeB = new Date(b.lastMessageAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, []);

  // Handle socket events
  useEffect(() => {
    // Handle initial conversations from socket
    const handleInitialConversations = ({ conversations, unreadCounts }: any) => {
      const enriched = conversations.map((c: Conversation) => ({
        ...c,
        lastMessageAt: c.lastMessageAt || c.createdAt,
        unreadCount: unreadCounts[c.id] || 0
      }));

      setConvos(sortConversations(enriched));
    };

    // Handle new conversation
    const handleNewConversation = (newConvo: Conversation) => {
      console.log("[Admin] 🆕 New conversation received:", newConvo.id);
      
      setConvos(prev => {
        // Check if conversation already exists
        if (prev.some(c => c.id === newConvo.id)) return prev;

        const enriched = {
          ...newConvo,
          lastMessageAt: newConvo.createdAt,
          unreadCount: 0
        };

        const updated = [enriched, ...prev];
        return sortConversations(updated);
      });

      // Play notification and show browser notification
      playNotification();
      showBrowserNotification(
        "New Conversation",
        `${newConvo.name} has started a chat`,
        newConvo.id
      );
    };

    // Handle new message
    const handleMessage = (msg: any) => {
      console.log("[Admin] 💬 Message received:", msg);
      
      setConvos(prev => {
        const updated = prev.map(c => {
          if (c.id === msg.conversationId) {
            // Calculate new unread count
            const currentUnread = c.unreadCount || 0;
            const isUnread = msg.sender === "visitor" && c.id !== activeIdRef.current;
            const newUnreadCount = isUnread ? currentUnread + 1 : currentUnread;

            return {
              ...c,
              lastMessage: msg.text,
              lastMessageAt: msg.createdAt,
              lastMessageSender: msg.sender,
              unreadCount: newUnreadCount
            };
          }
          return c;
        });

        return sortConversations(updated);
      });
    };

    // Handle message notification (for messages in conversations not currently viewing)
    const handleMessageNotification = ({ conversationId, message, unreadCount }: any) => {
      console.log("[Admin] 🔔 Message notification:", { conversationId, unreadCount });
      
      // Only show notification if not currently viewing this conversation
      if (conversationId !== activeIdRef.current) {
        const convo = convos.find(c => c.id === conversationId);
        const convoName = convo?.name || `Visitor #${conversationId.slice(0, 8)}`;

        // Play sound
        playNotification();

        // Show browser notification
        showBrowserNotification(
          `New message from ${convoName}`,
          message.text.length > 50 ? message.text.slice(0, 50) + "..." : message.text,
          conversationId
        );
      }

      // Update unread count
      setConvos(prev => {
        const updated = prev.map(c => {
          if (c.id === conversationId) {
            return { ...c, unreadCount: unreadCount };
          }
          return c;
        });
        return sortConversations(updated);
      });
    };

    // Handle conversation marked as read
    const handleConversationRead = ({ conversationId }: any) => {
      setConvos(prev => {
        const updated = prev.map(c => {
          if (c.id === conversationId) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        });
        return sortConversations(updated);
      });
    };

    // Handle unread counts update
    const handleUnreadCounts = (unreadCounts: { [key: string]: number }) => {
      setConvos(prev => {
        const updated = prev.map(c => ({
          ...c,
          unreadCount: unreadCounts[c.id] || 0
        }));
        return sortConversations(updated);
      });
    };

    // Register socket listeners
    socket.on("admin:initial-conversations", handleInitialConversations);
    socket.on("admin:new-conversation", handleNewConversation);
    socket.on("chat:message", handleMessage);
    socket.on("admin:message-notification", handleMessageNotification);
    socket.on("admin:conversation-read", handleConversationRead);
    socket.on("admin:unread-counts", handleUnreadCounts);

    return () => {
      socket.off("admin:initial-conversations", handleInitialConversations);
      socket.off("admin:new-conversation", handleNewConversation);
      socket.off("chat:message", handleMessage);
      socket.off("admin:message-notification", handleMessageNotification);
      socket.off("admin:conversation-read", handleConversationRead);
      socket.off("admin:unread-counts", handleUnreadCounts);
    };
  }, [convos, playNotification, showBrowserNotification, sortConversations, onSelect]);

  const handleSelect = useCallback((id: string) => {
    // Leave previous conversation room
    if (activeId && activeId !== id) {
      socket.emit("chat:leave", { conversationId: activeId });
    }

    setActiveId(id);
    onSelect(id);

    // Join new conversation room
    socket.emit("chat:join", { conversationId: id });

    // Mark conversation as read
    socket.emit("chat:mark-read", { conversationId: id });

    // Update local state
    setConvos(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, unreadCount: 0 } : c));
      return sortConversations(updated);
    });

    console.log(`[Admin] Selected conversation: ${id}`);
  }, [activeId, onSelect, sortConversations]);

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
  };

  // Manual sound test
  const testSound = () => {
    if (!soundEnabled) {
      // Try to enable sound
      notificationSound.current?.play()
        .then(() => {
          notificationSound.current?.pause();
          if (notificationSound.current) {
            notificationSound.current.currentTime = 0;
          }
          setSoundEnabled(true);
          console.log("[Admin] ✅ Sound manually enabled!");
        })
        .catch((err) => {
          console.error("[Admin] ❌ Manual sound test failed:", err);
          alert("Please click anywhere on the page first to enable sound notifications.");
        });
    } else {
      playNotification();
    }
  };

  const filteredConvos = convos.filter(
    c =>
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
    <aside className="w-80 border-r bg-white flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-400 to-blue-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Conversations</h2>
              <p className="text-xs text-white/80">
                {convos.length} active • {totalUnread} unread
              </p>
            </div>
          </div>

          {/* Notification controls */}
          <div className="flex gap-1">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-white/20 rounded-full transition"
              title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
            >
              {notificationsEnabled ? (
                <Bell size={18} className="text-white" />
              ) : (
                <BellOff size={18} className="text-white/60" />
              )}
            </button>
            
            <button
              onClick={testSound}
              className="p-2 hover:bg-white/20 rounded-full transition"
              title={soundEnabled ? "Test sound" : "Click to enable sound"}
            >
              {soundEnabled ? (
                <Volume2 size={18} className="text-white" />
              ) : (
                <VolumeX size={18} className="text-white/60" />
              )}
            </button>
          </div>
        </div>

        {/* Sound status indicator */}
        {!soundEnabled && (
          <div className="mb-2 text-xs text-white/90 bg-white/10 rounded px-2 py-1">
            ⚠️ Click anywhere to enable sound notifications
          </div>
        )}

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
              {searchTerm
                ? "Try a different search term"
                : "Waiting for visitors to connect..."}
            </p>
          </div>
        )}

        {filteredConvos.map(c => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`w-full text-left p-4 border-b hover:bg-gray-50 flex items-start gap-3 transition-all relative ${
              activeId === c.id
                ? "bg-blue-50 border-l-4 border-l-blue-500"
                : "border-l-4 border-l-transparent"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative ${
                activeId === c.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <Users size={18} />
              {c.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {c.unreadCount > 9 ? "9+" : c.unreadCount}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3
                  className={`font-medium text-sm truncate ${
                    activeId === c.id ? "text-blue-900" : "text-gray-900"
                  }`}
                >
                  {c.name}
                </h3>
                {c.lastMessageAt && (
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {formatTime(c.lastMessageAt)}
                  </span>
                )}
              </div>

              {c.lastMessage && (
                <p
                  className={`text-xs truncate ${
                    c.unreadCount > 0
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {c.lastMessageSender === "admin" && "You: "}
                  {c.lastMessage}
                </p>
              )}
            </div>

          
            {c.unreadCount > 0 && (
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

      {/* Footer info */}
      {!loading && filteredConvos.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {notificationsEnabled ? "🔔" : "🔕"} Notifications {notificationsEnabled ? "enabled" : "disabled"}
            {" • "}
            {soundEnabled ? "🔊" : "🔇"} Sound {soundEnabled ? "ready" : "inactive"}
          </p>
        </div>
      )}
    </aside>
  );
}