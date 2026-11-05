import { useState } from 'react'
import { initials } from '../../lib/format'
import { cn } from '../../lib/cn'

export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface text-brand', className)}>
      {src && !failed ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display">{initials(name)}</span>
      )}
    </div>
  )
}
