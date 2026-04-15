const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track which bookingId has an active astrologer
// bookingId → socketId of astrologer
const astrologerInRoom = new Map();

// ── HTTP: room-status ──────────────────────────────────────────────────────
// GET /room-status?bookingId=<bookingId>
// Returns { active: true } if astrologer is currently in the room
app.get("/room-status", (req, res) => {
  const { bookingId } = req.query;
  if (!bookingId) return res.json({ active: false });

  const socketId = astrologerInRoom.get(bookingId);
  const active = !!(socketId && io.sockets.sockets.has(socketId));

  // Clean up stale entry
  if (socketId && !io.sockets.sockets.has(socketId)) {
    astrologerInRoom.delete(bookingId);
  }

  res.json({ active });
});

// ── Socket.IO ──────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  socket.on("join-room", ({ bookingId, role, name }) => {
    socket.join(bookingId);
    socket.data = { bookingId, role, name };

    // Track astrologer presence
    if (role === "astrologer") {
      astrologerInRoom.set(bookingId, socket.id);
      console.log(`[room:${bookingId}] astrologer joined`);
    } else {
      console.log(`[room:${bookingId}] client joined`);
    }

    // Notify the other peer
    socket.to(bookingId).emit("user-joined", { name, role });

    // If both peers present, astrologer initiates the offer
    const clients = io.sockets.adapter.rooms.get(bookingId);
    if (clients && clients.size === 2) {
      const astrologerSocketId = astrologerInRoom.get(bookingId);
      if (astrologerSocketId) {
        // Tell astrologer who to call
        const clientSocketId = [...clients].find((id) => id !== astrologerSocketId);
        if (clientSocketId) {
          io.to(astrologerSocketId).emit("ready-to-call", { targetSocketId: clientSocketId });
        }
      }
    }
  });

  socket.on("call-user", ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit("incoming-call", { from: socket.id, offer });
  });

  socket.on("call-accepted", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("call-answered", { answer });
  });

  socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ bookingId }) => {
    socket.to(bookingId).emit("call-ended");
    astrologerInRoom.delete(bookingId);
  });

  socket.on("chat-message", ({ bookingId, sender, senderRole, message, timestamp }) => {
    // Broadcast chat message to other participants in the room
    socket.to(bookingId).emit("chat-message", { sender, senderRole, message, timestamp });
  });

  socket.on("disconnect", () => {
    const { bookingId, role } = socket.data || {};
    if (bookingId) {
      socket.to(bookingId).emit("peer-disconnected", { role });
      if (role === "astrologer") {
        astrologerInRoom.delete(bookingId);
      }
    }
    console.log("❌ Disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("🚀 Signaling server running on http://localhost:4000");
});
