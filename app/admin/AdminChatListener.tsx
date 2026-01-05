"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "@/lib/socket";

export default function AdminChatListener() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Initialize Audio Once Globally
  useEffect(() => {
    audioRef.current = new Audio("/noty.wav");
    audioRef.current.volume = 0.5;

    // Enable sound on first user interaction anywhere in the admin panel
    const enableSound = () => {
      audioRef.current?.play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          setSoundEnabled(true);
        })
        .catch(err => console.error("Sound init failed:", err));
    };

    window.addEventListener('click', enableSound, { once: true });
    window.addEventListener('keydown', enableSound, { once: true });

    return () => {
      window.removeEventListener('click', enableSound);
      window.removeEventListener('keydown', enableSound);
    };
  }, []);

  // 2. Helper to play sound
  const playNotification = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    
    const sound = audioRef.current;
    sound.currentTime = 0;
    sound.play().catch(e => console.error("Play failed", e));
  }, [soundEnabled]);

  // 3. Helper for Browser Notifications
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if (!notificationsEnabled || !("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/chat-icon.png",
        requireInteraction: false
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  // 4. Global Socket Listeners
  useEffect(() => {
    // Only listen for events that require notification
    const handleNotification = ({ conversationId, message }: any) => {
      // Logic: If we are NOT on the chat page, or if the chat window isn't focused
      // You can add logic here to check pathname if you want to skip notifications 
      // when the user is actually looking at the chat.
      
      console.log("[Global Listener] 🔔 Notification received");
      playNotification();
      showBrowserNotification("New Message", message.text);
    };

    const handleNewConversation = (newConvo: any) => {
      console.log("[Global Listener] 🆕 New Conversation");
      playNotification();
      showBrowserNotification("New Visitor", `${newConvo.name} started a chat`);
    };

    socket.on("admin:message-notification", handleNotification);
    socket.on("admin:new-conversation", handleNewConversation);

    return () => {
      socket.off("admin:message-notification", handleNotification);
      socket.off("admin:new-conversation", handleNewConversation);
    };
  }, [playNotification, showBrowserNotification]);

  // Render nothing - this is a logic-only component
  return null; 
}
