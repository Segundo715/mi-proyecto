import { NextRequest } from 'next/server'
import { getAllReviews, getPublishedReviews, createReview } from '@/lib/reviewDb'
import { verifySession } from '@/lib/auth'
import { sendBadReviewEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const isAdmin = verifySession(req.cookies.get('admin_session')?.value)
  const all = req.nextUrl.searchParams.get('all') === '1'
  return Response.json(isAdmin && all ? getAllReviews() : getPublishedReviews())
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  if (!data.customerName?.trim() || !data.comment?.trim() || !data.rating)
    return Response.json({ error: 'Datos incompletos' }, { status: 400 })
  const review = createReview({
    customerName: data.customerName.trim(),
    rating: Number(data.rating),
    comment: data.comment.trim(),
  })
  if (review.bad) {
    sendBadReviewEmail(review).catch(e => console.error('[email]', e))
  }
  return Response.json(review, { status: 201 })
}
