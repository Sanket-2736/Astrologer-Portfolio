import { CardSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="pt-24 pb-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse h-8 w-48 rounded mx-auto mb-12" style={{ background: 'rgba(201,168,76,0.08)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
