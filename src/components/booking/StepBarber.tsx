import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Barber } from '../../types'
import { Avatar } from '../ui'
import { cn } from '../../lib/cn'

interface Props {
  barbers: Barber[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function StepBarber({ barbers, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {barbers.map((b, i) => {
        const selected = b.id === selectedId
        return (
          <motion.button
            key={b.id}
            type="button"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(b.id)}
            aria-pressed={selected}
            className={cn(
              'relative flex flex-col items-center rounded-lg border bg-white px-3 pb-5 pt-6 text-center transition-all duration-200',
              selected
                ? 'border-brand shadow-[0_0_0_3px_rgba(93,214,44,0.18)]'
                : 'border-ink/10 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-soft',
            )}
          >
            {selected && (
              <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand text-night">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            <div className={cn('rounded-full p-1 transition-colors', selected ? 'bg-brand' : 'bg-mint')}>
              <Avatar name={b.name} src={b.photo} className="h-20 w-20 text-2xl sm:h-24 sm:w-24" />
            </div>
            <span className="mt-3 text-base font-bold leading-tight text-night">{b.name}</span>
            <span className="mt-1 text-xs text-ink/55">{b.specialty}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
