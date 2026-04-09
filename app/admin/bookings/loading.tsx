import { CardSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse h-8 w-48 rounded mb-8" style={{ background: 'rgba(201,168,76,0.08)' }} />
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
