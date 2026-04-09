import { CardSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="animate-pulse h-4 w-32 rounded mb-3" style={{ background: 'rgba(201,168,76,0.1)' }} />
          <div className="animate-pulse h-8 w-48 rounded" style={{ background: 'rgba(201,168,76,0.08)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
