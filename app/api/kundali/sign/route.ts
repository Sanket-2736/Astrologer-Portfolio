import { getSession } from '@/lib/session'
import { generateUploadSignature } from '@/lib/cloudinary'

// Returns a signed upload params so the client can upload directly to Cloudinary
export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { clientId } = await request.json()
    if (!clientId) return Response.json({ error: 'clientId required' }, { status: 400 })

    const params = await generateUploadSignature(`kundalis/${clientId}`)
    return Response.json(params)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
