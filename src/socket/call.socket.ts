import { Server, Socket } from "socket.io";

interface CallSession {
  caller: string;
  callee: string;
  type: "audio" | "video";
}

const activeCalls = new Map<string, CallSession>();

export const callSocket = (io: Server, socket: Socket) => {

  const userId: string = socket.data.userId.toString();

  console.log("📞 Call socket active:", userId);

  /* ---------------- START CALL ---------------- */

  socket.on("start_call", ({ callId, to, offer, type }) => {

    const receiverId = to?.toString();

    console.log("\n========== START CALL ==========");
    console.log("Caller:", userId);
    console.log("Receiver:", receiverId);
    console.log("CallID:", callId);
    console.log("Type:", type);

    if (!receiverId) {
      console.log("❌ Receiver missing");
      return;
    }

    // --- BUSY CHECK LOGIC ---
    // Check if the receiver is already involved in any active call
    const activeSessions = Array.from(activeCalls.values());
    const isBusy = activeSessions.some(
      call => call.caller === receiverId || call.callee === receiverId
    );

    if (isBusy) {
      console.log(`⚠️ User ${receiverId} is busy`);
      return socket.emit("call_busy", { 
        callId, 
        message: "User is in another call" 
      });
    }
    // ------------------------

    if (!offer) {
      console.log("❌ Offer missing from caller");
      return;
    }

    const callType = type === "video" ? "video" : "audio";

    console.log("✅ Offer received from caller");

    activeCalls.set(callId, {
      caller: userId,
      callee: receiverId,
      type: callType
    });

    const room = io.sockets.adapter.rooms.get(receiverId);

    if (!room) {
      console.log("⚠️ Receiver NOT in socket room:", receiverId);
    } else {
      console.log("✅ Receiver sockets in room:", room.size);
    }

    console.log("📡 Emitting incoming_call to:", receiverId);

    io.to(receiverId).emit("incoming_call", {
      callId,
      from: userId,
      offer,
      type: callType
    });

    console.log("================================\n");

  });

  /* ---------------- ANSWER CALL ---------------- */

  socket.on("answer_call", ({ callId, answer }) => {

    console.log("\n========== ANSWER CALL ==========");
    console.log("User answering:", userId);
    console.log("CallID:", callId);

    if (!answer) {
      console.log("❌ Answer missing");
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      console.log("❌ Call session not found");
      return;
    }

    console.log("📡 Sending call_answered to caller:", call.caller);

    io.to(call.caller).emit("call_answered", {
      callId,
      answer
    });

    console.log("================================\n");

  });

  /* ---------------- ICE ---------------- */

  socket.on("ice_candidate", ({ callId, to, candidate }) => {

    const receiverId = to?.toString();

    if (!receiverId) return;

    console.log("🧊 ICE candidate");
    console.log("From:", userId);
    console.log("To:", receiverId);
    console.log("CallID:", callId);

    io.to(receiverId).emit("ice_candidate", {
      callId,
      candidate
    });

  });

  /* ---------------- END CALL ---------------- */

  // UPDATED: Added 'to' parameter for fail-safe routing
  socket.on("end_call", ({ callId, to }) => {

    console.log("\n📴 END CALL");
    console.log("User:", userId);
    console.log("CallID:", callId);

    const call = activeCalls.get(callId);

    if (call) {
      console.log("📡 Notifying both users via Map");
      io.to(call.caller).emit("call_ended", { callId });
      io.to(call.callee).emit("call_ended", { callId });
      activeCalls.delete(callId);
    } else if (to) {
      // FAIL-SAFE: If the map lookup fails (race condition), notify the 'to' user directly
      console.log("📡 Map lookup failed, using fail-safe 'to' ID:", to);
      io.to(to).emit("call_ended", { callId });
    } else {
      console.log("⚠️ Call session already removed and no 'to' ID provided");
    }

  });

  /* ---------------- DISCONNECT ---------------- */

  socket.on("disconnect", () => {

    console.log("⚠️ User disconnected:", userId);

    for (const [callId, call] of activeCalls.entries()) {

      if (call.caller === userId || call.callee === userId) {

        const otherUser =
          call.caller === userId ? call.callee : call.caller;

        console.log("📡 Ending call due to disconnect");
        console.log("CallID:", callId);

        io.to(otherUser).emit("call_ended", { callId });

        activeCalls.delete(callId);

      }

    }

  });

};