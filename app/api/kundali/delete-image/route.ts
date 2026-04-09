import { connectDB } from '@/lib/mongodb'
import Kundali from '@/models/Kundali'
import { getSession } from '@/lib/session'
import { deleteCloudinaryImage } from '@/lib/cloudinary'

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { kundaliId, publicId } = await request.json()
    if (!kundaliId || !publicId) {
      return Response.json({ error: 'kundaliId and publicId required' }, { status: 400 })
    }

    await connectDB()

    // Remove from Cloudinary
    await deleteCloudinaryImage(publicId)

    // Remove from MongoDB
    await Kundali.findByIdAndUpdate(kundaliId, {
      $pull: { images: { publicId } },
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
