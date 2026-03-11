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

      if (!token) return next(new Error("Auth error"));

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;

      socket.data.userId = decoded.id.toString();

      next();

    } catch {

      next(new Error("Auth error"));

    }

  });

  /* ---------------- CONNECTION ---------------- */

  io.on("connection", (socket: Socket) => {

    const userId = socket.data.userId;

    socket.join(userId);

    /* ---------------- TRACK ONLINE USERS ---------------- */

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId)?.add(socket.id);

    console.log("User online:", userId);

    /* SEND CURRENT ONLINE USERS */

    socket.emit(
      "online_users",
      Array.from(onlineUsers.keys())
    );

    /* BROADCAST USER ONLINE */

    socket.broadcast.emit("user_online", { userId });

    /* SOCKET MODULES */

    chatSocket(io, socket);
    callSocket(io, socket);

    /* ---------------- DISCONNECT ---------------- */

    socket.on("disconnect", () => {

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

  if (!io) throw new Error("Socket not initialized");

  return io;

};