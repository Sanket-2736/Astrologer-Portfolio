export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: 'rgba(201,168,76,0.08)', ...style }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="mystic-card p-5 flex flex-col gap-3">
      <Skeleton style={{ height: '16px', width: '60%' }} />
      <Skeleton style={{ height: '12px', width: '80%' }} />
      <Skeleton style={{ height: '12px', width: '40%' }} />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton style={{ height: '12px', width: i === 0 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  )
}
