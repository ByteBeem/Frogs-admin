import { io, Socket } from "socket.io-client";

const SOCKET_URL ="https://api.blackfroglabs.co.za";

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token");
  }
  return null;
};

// Create socket instance with proper configuration
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
  transports: ["websocket", "polling"],
  auth: (cb) => {
    // Dynamic auth callback that gets the latest token
    cb({ token: getToken() });
  },
});

// Connection event handlers for debugging
if (process.env.NODE_ENV === "development") {
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("🔴 Socket connection error:", error.message);
  });

  socket.on("error", (error) => {
    console.error("🔴 Socket error:", error);
  });
}

// Helper function to update socket auth (for when admin logs in)
export const updateSocketAuth = () => {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.auth = { token: getToken() };
  socket.connect();
};

export default socket;