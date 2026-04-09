import { connectDB } from '@/lib/mongodb'
import AstrologerSettings from '@/models/AstrologerSettings'
import { getSession } from '@/lib/session'

export async function GET() {
  await connectDB()
  const settings = await AstrologerSettings.findOne().lean()
  return Response.json(JSON.parse(JSON.stringify(settings ?? {})))
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    await connectDB()
    const settings = await AstrologerSettings.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, new: true }
    )
    return Response.json({ success: true, settings: JSON.parse(JSON.stringify(settings)) })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
