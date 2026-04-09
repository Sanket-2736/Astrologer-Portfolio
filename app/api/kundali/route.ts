import { connectDB } from '@/lib/mongodb'
import Kundali from '@/models/Kundali'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  try {
    await connectDB()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    if (session.role === 'client') {
      query.clientId = session.userId
    } else if (clientId) {
      query.clientId = clientId
    }

    const kundalis = await Kundali.find(query)
      .sort({ createdAt: -1 })
      .populate('clientId', 'name email')
      .lean()

    return Response.json(JSON.parse(JSON.stringify(kundalis)))
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { clientId, images, notes, bookingId } = body

    if (!clientId || !images?.length) {
      return Response.json({ error: 'clientId and images required' }, { status: 400 })
    }

    await connectDB()

    // Upsert: one Kundali doc per client (append images)
    const existing = await Kundali.findOne({ clientId })
    if (existing) {
      existing.images.push(...images)
      if (notes !== undefined) existing.notes = notes
      if (bookingId) existing.bookingId = bookingId
      await existing.save()
      return Response.json(JSON.parse(JSON.stringify(existing)))
    }

    const kundali = await Kundali.create({ clientId, images, notes, bookingId, uploadedBy: 'astrologer' })
    return Response.json(JSON.parse(JSON.stringify(kundali)), { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { kundaliId, notes } = await request.json()
    await connectDB()
    const updated = await Kundali.findByIdAndUpdate(kundaliId, { notes }, { new: true })
    return Response.json(JSON.parse(JSON.stringify(updated)))
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
