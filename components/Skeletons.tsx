export function FoodLogSkeleton() {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-1/2" />
      </div>
      <div className="h-5 skeleton rounded-lg w-14" />
    </div>
  )
}

export function RingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-36 h-36 rounded-full skeleton" />
      <div className="flex gap-8">
        <div className="h-8 w-16 skeleton rounded-lg" />
        <div className="h-8 w-16 skeleton rounded-lg" />
      </div>
    </div>
  )
}

export function MacroBarSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between">
            <div className="h-3 skeleton rounded w-16" />
            <div className="h-3 skeleton rounded w-10" />
          </div>
          <div className="h-2 skeleton rounded-full w-full" />
        </div>
      ))}
    </div>
  )
}
