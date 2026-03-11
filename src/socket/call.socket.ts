import { Server, Socket } from "socket.io";

const activeCalls = new Map<string, string>();
const pendingCalls = new Map<string, string>();

export const callSocket = (io: Server, socket: Socket) => {

  const userId = socket.data.userId;

  console.log("📞 Call socket active:", userId);

  /* ---------------- CALL USER ---------------- */

  socket.on("call_user", ({ to, offer }) => {

    if (activeCalls.has(userId) || activeCalls.has(to)) {

      console.log("❌ Call rejected - user already in call");

      socket.emit("call_busy");

      return;

    }

    console.log(`📤 ${userId} calling ${to}`);

    pendingCalls.set(userId, to);

    io.to(to).emit("incoming_call", {
      from: userId,
      offer,
    });

  });

  /* ---------------- ANSWER CALL ---------------- */

  socket.on("call_answer", ({ to, answer }) => {

    console.log(`✅ ${userId} accepted call from ${to}`);

    pendingCalls.delete(to);

    activeCalls.set(userId, to);
    activeCalls.set(to, userId);

    io.to(to).emit("call_answered", {
      answer,
    });

  });

  /* ---------------- REJECT CALL ---------------- */

  socket.on("reject_call", ({ to }) => {

    console.log(`❌ ${userId} rejected call from ${to}`);

    pendingCalls.delete(to);

    io.to(to).emit("call_rejected");

  });

  /* ---------------- ICE ---------------- */

  socket.on("ice_candidate", ({ to, candidate }) => {

    io.to(to).emit("ice_candidate", {
      candidate,
    });

  });

  /* ---------------- END CALL ---------------- */

  socket.on("end_call", ({ to }) => {

    console.log(`📴 ${userId} ended call`);

    activeCalls.delete(userId);
    activeCalls.delete(to);

    io.to(to).emit("call_ended");

  });

  /* ---------------- DISCONNECT ---------------- */

  socket.on("disconnect", () => {

    const peer = activeCalls.get(userId);

    if (peer) {

      console.log(`📴 ${userId} disconnected during call`);

      io.to(peer).emit("call_ended");

      activeCalls.delete(userId);
      activeCalls.delete(peer);

    }

    pendingCalls.delete(userId);

  });

};