"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  User, 
  X, 
  MessageSquare, 
  CalendarCheck, 
  CheckCircle2, 
  Info 
} from "lucide-react";
import io, { Socket } from "socket.io-client";
import { format } from "date-fns"; 

// --- TYPES ---
interface NotificationItem {
  id: string;
  type: 'message' | 'booking' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  details?: any; 
}

interface InitialData {
  conversations: any[];
  unreadCounts: Record<string, number>;
}

export default function Topbar() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Audio
  useEffect(() => {
    // Ensure 'noty.wav' exists in your public folder
    audioRef.current = new Audio("/noty.wav");
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.warn("Audio blocked:", err));
    }
  };

  // 2. Handle Clicking Outside Dropdown to Close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Helper to Add Notification to State
  const addNotification = (newItem: NotificationItem) => {
    playSound();
    // Add new item to the TOP of the list
    setNotifications((prev) => [newItem, ...prev]);
    // Increment badge
    setUnreadCount((prev) => prev + 1);
  };

  // 4. Socket Connection & Listeners
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : null;
    const SOCKET_URL = "https://api.blackfroglabs.co.za";

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    // --- A. INITIAL LOAD (Existing Chat Counts) ---
    socket.on("admin:initial-conversations", (data: InitialData) => {
      const totalUnread = Object.values(data.unreadCounts || {}).reduce(
        (acc, count) => acc + count, 
        0
      );
      setUnreadCount(totalUnread);
    });

    // --- B. NEW CHAT (Visitor Started) ---
    socket.on("admin:new-conversation", (data) => {
      addNotification({
        id: `conv-${Date.now()}`, // Generate unique ID
        type: 'message',
        title: 'New Conversation',
        message: `Visitor #${data.visitorId.slice(0, 8)} started a chat.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    });

    // --- C. NEW MESSAGE (Visitor Message) ---
    socket.on("admin:message-notification", (data) => {
      addNotification({
        id: `msg-${Date.now()}`,
        type: 'message',
        title: 'New Message',
        message: data.message.text.length > 40 
          ? `${data.message.text.substring(0, 40)}...` 
          : data.message.text,
        timestamp: new Date().toISOString(),
        read: false,
        details: { conversationId: data.conversationId }
      });
    });

    // --- D. NEW BOOKING (From API) ---
    socket.on("admin:new-booking", (data) => {
      addNotification({
        id: `book-${Date.now()}`,
        type: 'booking',
        title: data.title,    // "New Booking Received"
        message: data.message, // "John Doe booked a repair..."
        timestamp: data.timestamp,
        read: false,
        details: data.details
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 5. Actions
  const handleMarkAllRead = () => {
    setNotifications([]);
    setUnreadCount(0);
    setIsDropdownOpen(false);
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent dropdown from closing
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Decrease count but don't go below 0
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-30">
      
      {/* Left Side: Title */}
      <div className="flex flex-col">
         <span className="font-bold text-slate-800">Welcome back</span>
         <span className="text-xs text-slate-500">Admin Dashboard</span>
      </div>

      <div className="flex items-center gap-6">
        
        {/* --- NOTIFICATION BELL & DROPDOWN --- */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className={`relative p-2 rounded-full transition-colors outline-none focus:ring-2 focus:ring-slate-200 ${isDropdownOpen ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
            onClick={toggleDropdown}
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            
            {/* Red Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* --- DROPDOWN MODAL --- */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Bell className="w-10 h-10 mb-2 opacity-10" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {notifications.map((note) => (
                      <li key={note.id} className="group relative p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex gap-3">
                          
                          {/* Icon Circle (Color based on Type) */}
                          <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                            ${note.type === 'booking' ? 'bg-indigo-100 text-indigo-600' : 
                              note.type === 'message' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                            
                            {note.type === 'booking' && <CalendarCheck className="w-4 h-4" />}
                            {note.type === 'message' && <MessageSquare className="w-4 h-4" />}
                            {note.type === 'system' && <Info className="w-4 h-4" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pr-6">
                            <p className="text-xs font-semibold text-slate-700 mb-0.5">{note.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{note.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {format(new Date(note.timestamp), "h:mm a · MMM d")}
                            </span>
                          </div>

                          {/* Dismiss Button (Visible on Hover) */}
                          <button 
                            onClick={(e) => handleDismiss(e, note.id)}
                            className="absolute top-3 right-3 p-1 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Footer */}
              {notifications.length > 0 && (
                <div className="bg-slate-50 px-4 py-2 text-center border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Real-time updates active</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* --- END NOTIFICATION SECTION --- */}

        {/* User Profile Section */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700">Admin</p>
            <p className="text-[10px] text-emerald-500 font-medium">Online</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border border-slate-200 shadow-sm text-slate-500">
             <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
