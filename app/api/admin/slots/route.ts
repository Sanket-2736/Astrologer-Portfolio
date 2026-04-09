import { connectDB } from '@/lib/mongodb'
import Slot from '@/models/Slot'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const slots = await Slot.find().sort({ dayOfWeek: 1, startTime: 1 }).lean()
  return Response.json(JSON.parse(JSON.stringify(slots)))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    await connectDB()
    const slot = await Slot.create(body)
    return Response.json(slot, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await connectDB()
  await Slot.findByIdAndDelete(id)
  return Response.json({ success: true })
}
