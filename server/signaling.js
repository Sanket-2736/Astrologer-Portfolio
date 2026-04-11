/**
 * WebRTC Signaling Server — Socket.IO
 * Run with: node server/signaling.js
 * Default port: 4000
 */

const { createServer } = require('http')
const { Server } = require('socket.io')

const PORT = process.env.SIGNALING_PORT || 4000
const NEXT_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: [NEXT_ORIGIN, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Maps: bookingId → { astrologer: socketId, client: socketId }
const rooms = new Map()
// Maps: socketId → { bookingId, role, name }
const peers = new Map()

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`)

  // ── join-room ────────────────────────────────────────────────────────────
  // Payload: { bookingId, role: 'astrologer'|'client', name }
  socket.on('join-room', ({ bookingId, role, name }) => {
    if (!bookingId || !role) return

    socket.join(bookingId)
    peers.set(socket.id, { bookingId, role, name })

    if (!rooms.has(bookingId)) rooms.set(bookingId, {})
    const room = rooms.get(bookingId)
    room[role] = socket.id

    console.log(`[room:${bookingId}] ${role} joined (${socket.id})`)

    // Tell the other peer someone joined
    socket.to(bookingId).emit('user-joined', { role, name, socketId: socket.id })

    // If both peers are present, tell the astrologer to initiate the offer
    const { astrologer, client } = room
    if (astrologer && client) {
      io.to(astrologer).emit('ready-to-call', { targetSocketId: client })
    }
  })

  // ── call-user (offer) ────────────────────────────────────────────────────
  // Payload: { targetSocketId, offer (RTCSessionDescriptionInit) }
  socket.on('call-user', ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit('incoming-call', {
      from: socket.id,
      offer,
    })
  })

  // ── call-accepted (answer) ───────────────────────────────────────────────
  // Payload: { targetSocketId, answer (RTCSessionDescriptionInit) }
  socket.on('call-accepted', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('call-answered', { answer })
  })

  // ── ice-candidate ────────────────────────────────────────────────────────
  // Payload: { targetSocketId, candidate (RTCIceCandidateInit) }
  socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('ice-candidate', { candidate })
  })

  // ── end-call ─────────────────────────────────────────────────────────────
  socket.on('end-call', ({ bookingId }) => {
    socket.to(bookingId).emit('call-ended')
    cleanupRoom(bookingId)
  })

  // ── disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const peer = peers.get(socket.id)
    if (peer) {
      const { bookingId, role } = peer
      socket.to(bookingId).emit('peer-disconnected', { role })
      const room = rooms.get(bookingId)
      if (room) {
        delete room[role]
        if (!room.astrologer && !room.client) rooms.delete(bookingId)
      }
      peers.delete(socket.id)
    }
    console.log(`[-] Disconnected: ${socket.id}`)
  })

  function cleanupRoom(bookingId) {
    rooms.delete(bookingId)
    for (const [sid, p] of peers.entries()) {
      if (p.bookingId === bookingId) peers.delete(sid)
    }
  }
})

httpServer.listen(PORT, () => {
  console.log(`✅ Signaling server running on port ${PORT}`)
})
