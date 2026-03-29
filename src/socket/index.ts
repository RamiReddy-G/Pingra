import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

import { chatSocket } from "./chat.socket";
import { callSocket } from "./call.socket";

const onlineUsers = new Map<string, Set<string>>();

let io: Server;

export const initSocket = (httpServer: any) => {

  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  /* ---------------- AUTH ---------------- */

  io.use((socket, next) => {

    try {

      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("❌ Socket auth failed: token missing");
        return next(new Error("Auth error"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;

      const userId = decoded.id.toString();

      socket.data.userId = userId;

      console.log("🔐 Socket authenticated:", userId);

      next();

    } catch (err) {

      console.log("❌ Socket auth error");

      next(new Error("Auth error"));

    }

  });

  /* ---------------- CONNECTION ---------------- */

  io.on("connection", (socket: Socket) => {

    const userId: string = socket.data.userId.toString();

    console.log("\n========== SOCKET CONNECTED ==========");
    console.log("User:", userId);
    console.log("Socket ID:", socket.id);

    /* JOIN PERSONAL ROOM */

    socket.join(userId);

    console.log("🏠 Joined room:", userId);

    /* ---------------- TRACK ONLINE USERS ---------------- */

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId)?.add(socket.id);

    console.log("User online:", userId);

    /* SEND CURRENT ONLINE USERS */

    socket.emit(
      "online_users",
      Array.from(onlineUsers.keys()).map(String)
    );

    /* BROADCAST USER ONLINE */

    socket.broadcast.emit("user_online", { userId });

    /* ---------------- SOCKET MODULES ---------------- */

    chatSocket(io, socket);
    callSocket(io, socket);

    /* ---------------- DISCONNECT ---------------- */

    socket.on("disconnect", () => {

      console.log("\n⚠️ Socket disconnected:", socket.id);

      const sockets = onlineUsers.get(userId);

      sockets?.delete(socket.id);

      if (sockets && sockets.size === 0) {

        onlineUsers.delete(userId);

        socket.broadcast.emit("user_offline", { userId });

        console.log("User offline:", userId);

      }

    });

  });

};

export const getIO = () => {

  if (!io) {
    throw new Error("Socket not initialized");
  }

  return io;

};