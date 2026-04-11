// Checks whether the astrologer has started the meeting for a given booking.
// The signaling server exposes a simple HTTP endpoint we can query.
// Falls back gracefully if signaling server is unreachable.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('bookingId')
  if (!bookingId) return Response.json({ active: false })

  const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'http://localhost:4000'

  try {
    const res = await fetch(`${signalingUrl}/room-status?bookingId=${bookingId}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return Response.json({ active: false })
    const data = await res.json()
    return Response.json({ active: !!data.active })
  } catch {
    return Response.json({ active: false })
  }
}
