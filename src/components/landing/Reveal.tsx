import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Small uppercase label above section titles. */
export function Eyebrow({ children, tone = 'dark', className }: { children: ReactNode; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]',
        tone === 'light' ? 'text-brand' : 'text-brand-dark',
        className,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', tone === 'light' ? 'bg-brand' : 'bg-brand-dark')} />
      {children}
    </p>
  )
}

/** True when the shop is open right now (local time). */
export function isOpenNow(hours: Record<number, { start: number; end: number } | null>, now = new Date()) {
  const h = hours[now.getDay()]
  if (!h) return false
  const m = now.getHours() * 60 + now.getMinutes()
  return m >= h.start * 60 && m < h.end * 60
}
