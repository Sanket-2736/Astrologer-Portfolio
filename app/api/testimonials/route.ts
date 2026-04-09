import { connectDB } from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'

export async function GET() {
  try {
    await connectDB()
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean()
    return Response.json(testimonials)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}
