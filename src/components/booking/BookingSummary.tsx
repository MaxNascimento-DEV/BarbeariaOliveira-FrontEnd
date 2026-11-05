import { CalendarDays, Clock, Scissors, User } from 'lucide-react'
import type { Barber, Service } from '../../types'
import { cn } from '../../lib/cn'
import { formatBRL, formatDuration, formatLongDate } from '../../lib/format'

interface Props {
  service?: Service
  barber?: Barber
  date?: string | null
  time?: string | null
  tone?: 'light' | 'dark'
  className?: string
}

export function BookingSummary({ service, barber, date, time, tone = 'light', className }: Props) {
  const dark = tone === 'dark'
  const rows = [
    { icon: Scissors, label: 'Serviço', value: service ? `${service.name} · ${formatDuration(service.duration)}` : '—' },
    { icon: User, label: 'Barbeiro', value: barber?.name ?? '—' },
    { icon: CalendarDays, label: 'Data', value: date ? formatLongDate(date) : '—' },
    { icon: Clock, label: 'Horário', value: time ?? '—' },
  ]
  return (
    <div className={cn('rounded-lg border p-5', dark ? 'border-brand/25 bg-night text-paper' : 'border-ink/10 bg-mint/50', className)}>
      <dl className="space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon aria-hidden className={cn('mt-0.5 h-4 w-4 shrink-0', dark ? 'text-brand' : 'text-brand-dark')} />
            <dt className={cn('w-20 shrink-0 text-sm', dark ? 'text-paper/60' : 'text-ink/55')}>{label}</dt>
            <dd className="min-w-0 flex-1 text-sm font-semibold capitalize-first">{value}</dd>
          </div>
        ))}
      </dl>
      {service && (
        <div className={cn('mt-4 flex items-center justify-between border-t pt-4', dark ? 'border-brand/20' : 'border-ink/10')}>
          <span className={cn('text-sm', dark ? 'text-paper/60' : 'text-ink/55')}>Total</span>
          <span className={cn('font-display text-xl font-semibold', dark ? 'text-brand' : 'text-night')}>{formatBRL(service.price)}</span>
        </div>
      )}
    </div>
  )
}
