import { motion } from 'framer-motion'
import { Check, Clock } from 'lucide-react'
import type { Service } from '../../types'
import { ServiceIcon } from '../ui'
import { cn } from '../../lib/cn'
import { formatBRL, formatDuration } from '../../lib/format'

interface Props {
  services: Service[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function StepService({ services, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {services.map((s, i) => {
        const selected = s.id === selectedId
        return (
          <motion.button
            key={s.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(s.id)}
            aria-pressed={selected}
            className={cn(
              'group flex w-full items-center gap-4 rounded-lg border bg-white p-4 text-left transition-all duration-200',
              selected
                ? 'border-brand shadow-[0_0_0_3px_rgba(93,214,44,0.18)]'
                : 'border-ink/10 hover:border-ink/25 hover:bg-mint/40',
            )}
          >
            <span
              className={cn(
                'grid h-12 w-12 shrink-0 place-items-center rounded-md transition-colors',
                selected ? 'bg-night text-brand' : 'bg-mint text-brand-dark group-hover:bg-surface group-hover:text-brand',
              )}
            >
              <ServiceIcon name={s.icon} className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold leading-tight text-night">{s.name}</span>
              <span className="mt-0.5 line-clamp-2 text-sm text-ink/65">{s.description}</span>
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-ink/50">
                <Clock className="h-3.5 w-3.5" /> {formatDuration(s.duration)}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-2">
              <span className="font-semibold text-brand-dark">{formatBRL(s.price)}</span>
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full border transition-all',
                  selected ? 'border-brand bg-brand text-night' : 'border-ink/20',
                )}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
