import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-1.5">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 flex-col gap-2">
            <div className="relative h-1 overflow-hidden rounded-full bg-surface/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-brand"
                initial={false}
                animate={{ width: done || active ? '100%' : '0%' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            </div>
            <span
              className={cn(
                'hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-wider sm:flex',
                active ? 'text-night' : done ? 'text-brand-dark/60' : 'text-ink/35',
              )}
            >
              {done && <Check aria-hidden className="h-3 w-3 text-brand-dark" />}
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
