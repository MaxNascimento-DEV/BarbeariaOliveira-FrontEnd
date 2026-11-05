import type { AppointmentStatus } from '../../types'
import { cn } from '../../lib/cn'

const STATUS: Record<AppointmentStatus, { label: string; cls: string; dot: string }> = {
  agendado: { label: 'Agendado', cls: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-sky-500' },
  confirmado: { label: 'Confirmado', cls: 'bg-mint text-brand-dark ring-brand-dark/25', dot: 'bg-brand-dark' },
  em_andamento: { label: 'Em atendimento', cls: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  finalizado: { label: 'Finalizado', cls: 'bg-ink/[0.06] text-ink/75 ring-ink/15', dot: 'bg-ink/50' },
  cancelado: { label: 'Cancelado', cls: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
}

export const STATUS_OPTIONS = (Object.keys(STATUS) as AppointmentStatus[]).map((value) => ({
  value,
  label: STATUS[value].label,
}))

export function StatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  const s = STATUS[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', s.cls, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        active ? 'bg-mint text-brand-dark ring-brand-dark/20' : 'bg-ink/5 text-ink/50 ring-ink/10',
      )}
    >
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )
}
