import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'
import { Avatar, Button, Card, CardHeader, Modal, StatusBadge, STATUS_OPTIONS, useToast } from '../../components/ui'
import { useAppStore } from '../../store/AppStore'
import { formatBRL, formatLongDate, fromISODate, toISODate } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Appointment, AppointmentStatus } from '../../types'
import { PageHeader } from './AdminLayout'
import { NEW_APPOINTMENTS_EVENT } from '../../lib/useNewAppointmentAlerts'

const FILTERS: Array<{ value: AppointmentStatus | 'todos'; label: string }> = [{ value: 'todos', label: 'Todos' }, ...STATUS_OPTIONS]

/** O agendador do backend muda status sozinho (cancela não confirmados, inicia, conclui). */
const AUTO_REFRESH_MS = 60_000

export default function Dashboard() {
  const { barbers, listAppointments, confirmAppointment, cancelAppointment, isAdmin } = useAppStore()
  const toast = useToast()
  const [date, setDate] = useState(() => toISODate(new Date()))
  const [filter, setFilter] = useState<AppointmentStatus | 'todos'>('todos')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toCancel, setToCancel] = useState<Appointment | null>(null)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const list = await listAppointments(date)
        setAppointments(list)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    },
    [date, listAppointments],
  )

  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), AUTO_REFRESH_MS)
    // Chegou agendamento novo (aviso do painel): recarrega na hora
    const onNew = () => load(true)
    window.addEventListener(NEW_APPOINTMENTS_EVENT, onNew)
    return () => {
      clearInterval(timer)
      window.removeEventListener(NEW_APPOINTMENTS_EVENT, onNew)
    }
  }, [load])

  const photo = (barberId: string) => barbers.find((b) => b.id === barberId)?.photo

  const ofDay = useMemo(() => [...appointments].sort((a, b) => a.time.localeCompare(b.time)), [appointments])
  const rows = filter === 'todos' ? ofDay : ofDay.filter((a) => a.status === filter)

  const stats = useMemo(() => {
    const valid = ofDay.filter((a) => a.status !== 'cancelado')
    return {
      total: ofDay.length,
      pending: ofDay.filter((a) => a.status === 'agendado' || a.status === 'confirmado' || a.status === 'em_andamento').length,
      done: ofDay.filter((a) => a.status === 'finalizado').length,
      revenue: valid.reduce((sum, a) => sum + a.price, 0),
    }
  }, [ofDay])

  const shiftDay = (n: number) => {
    const d = fromISODate(date)
    d.setDate(d.getDate() + n)
    setDate(toISODate(d))
  }

  const replace = (updated: Appointment) => setAppointments((list) => list.map((a) => (a.id === updated.id ? updated : a)))

  const confirm = async (a: Appointment) => {
    setBusyId(a.id)
    try {
      const updated = await confirmAppointment(a.id)
      replace(updated)
      toast.success('Agendamento confirmado', 'Avise o cliente pelo WhatsApp.')
    } catch (err) {
      toast.error('Não foi possível confirmar', (err as Error).message)
      load(true)
    } finally {
      setBusyId(null)
    }
  }

  const cancel = async (a: Appointment) => {
    setBusyId(a.id)
    try {
      const updated = await cancelAppointment(a.id)
      replace(updated)
      setToCancel(null)
      toast.info('Agendamento cancelado', 'Avise o cliente pelo WhatsApp.')
    } catch (err) {
      toast.error('Não foi possível cancelar', (err as Error).message)
      load(true)
    } finally {
      setBusyId(null)
    }
  }

  const cards = [
    { label: 'Agendamentos', value: stats.total, icon: CalendarDays },
    { label: 'A atender', value: stats.pending, icon: Clock },
    { label: 'Finalizados', value: stats.done, icon: CheckCircle2 },
    { label: 'Faturamento previsto', value: formatBRL(stats.revenue), icon: Wallet, highlight: true },
  ]

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Agenda do dia' : 'Minha agenda'}
        subtitle={formatLongDate(date)}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => load()}
              className="grid h-11 w-11 place-items-center rounded-lg border border-ink/10 bg-white text-brand-dark shadow-soft hover:bg-mint"
              aria-label="Atualizar agenda"
              title="Atualizar"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <div className="flex items-center gap-1 rounded-lg border border-ink/10 bg-white p-1 shadow-soft">
              <button onClick={() => shiftDay(-1)} className="grid h-9 w-9 place-items-center rounded-md text-brand-dark hover:bg-mint" aria-label="Dia anterior">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="h-9 rounded-md bg-transparent px-2 text-sm font-medium text-night focus:outline-none"
              />
              <button onClick={() => shiftDay(1)} className="grid h-9 w-9 place-items-center rounded-md text-brand-dark hover:bg-mint" aria-label="Próximo dia">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn('rounded-lg p-5 shadow-soft', c.highlight ? 'bg-night text-paper' : 'border border-ink/10 bg-white')}
          >
            <c.icon className={cn('h-5 w-5', c.highlight ? 'text-brand' : 'text-brand-dark/60')} />
            <p className={cn('mt-4 text-xl font-extrabold tabular-nums xl:text-2xl', c.highlight ? 'text-brand' : 'text-night')}>{c.value}</p>
            <p className={cn('mt-1 text-xs sm:text-sm', c.highlight ? 'text-paper/60' : 'text-ink/55')}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-night">Agendamentos</h2>
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  filter === f.value ? 'bg-night text-paper' : 'text-ink/60 hover:bg-mint',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardHeader>

        {loading && !appointments.length ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-ink/55">
            <Loader2 className="h-5 w-5 animate-spin text-brand-dark" /> Carregando agenda...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <XCircle aria-hidden className="h-8 w-8 text-red-600" />
            <p className="text-sm text-ink/70">{error}</p>
            <Button variant="ghost" onClick={() => load()} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Tentar de novo
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <XCircle aria-hidden className="h-8 w-8 text-brand-dark" />
            <p className="font-display text-lg text-night">Nenhum agendamento</p>
            <p className="text-sm text-ink/55">Não há horários com este filtro para o dia selecionado.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-mint/50 text-xs uppercase tracking-wider text-ink/50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Horário</th>
                    <th className="px-6 py-3 font-semibold">Cliente</th>
                    <th className="px-6 py-3 font-semibold">Serviço</th>
                    <th className="px-6 py-3 font-semibold">Barbeiro</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {rows.map((a) => (
                    <tr key={a.id} className={cn('transition hover:bg-mint/30', a.status === 'cancelado' && 'opacity-60')}>
                      <td className="px-6 py-4">
                        <p className="font-display text-base font-semibold tabular-nums text-night">{a.time}</p>
                        <p className="text-xs tabular-nums text-ink/45">até {a.endTime}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{a.clientName}</p>
                        <p className="text-xs text-ink/50">{a.clientPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-ink/80">{a.serviceName}</p>
                        <p className="text-xs text-ink/50">{formatBRL(a.price)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={a.barberName} src={photo(a.barberId)} className="h-8 w-8 text-xs" />
                          <span className="text-ink/80">{a.barberName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Actions a={a} busy={busyId === a.id} onConfirm={() => confirm(a)} onCancel={() => setToCancel(a)} className="justify-end" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-ink/5 xl:hidden">
              {rows.map((a) => (
                <li key={a.id} className={cn('flex gap-4 px-5 py-4', a.status === 'cancelado' && 'opacity-60')}>
                  <span className="w-16 shrink-0 font-display text-base font-semibold tabular-nums text-night">{a.time}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold">{a.clientName}</p>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="truncate text-sm text-ink/60">
                      {a.serviceName} · {a.barberName.split(' ')[0]} · {formatBRL(a.price)}
                    </p>
                    <p className="text-xs text-ink/45">{a.clientPhone}</p>
                    <Actions a={a} busy={busyId === a.id} onConfirm={() => confirm(a)} onCancel={() => setToCancel(a)} className="mt-3" />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Modal
        open={!!toCancel}
        onClose={() => busyId === null && setToCancel(null)}
        title="Cancelar agendamento?"
        description={toCancel ? `${toCancel.clientName} · ${toCancel.serviceName} às ${toCancel.time}` : undefined}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setToCancel(null)} disabled={busyId !== null}>
              Voltar
            </Button>
            <Button variant="danger" onClick={() => toCancel && cancel(toCancel)} loading={busyId !== null} loadingText="Cancelando...">
              Cancelar agendamento
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink/70">O horário volta a ficar livre no site. Depois, use “Avisar cliente” para mandar a mensagem de cancelamento no WhatsApp.</p>
      </Modal>
    </>
  )
}

/** Confirmar / cancelar (regras do StatusAgendamento no backend) + link wa.me para o cliente. */
function Actions({
  a,
  busy,
  onConfirm,
  onCancel,
  className,
}: {
  a: Appointment
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
  className?: string
}) {
  const canConfirm = a.status === 'agendado'
  const canCancel = a.status === 'agendado' || a.status === 'confirmado' || a.status === 'em_andamento'
  const btn = 'inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition disabled:opacity-50'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {canConfirm && (
        <button onClick={onConfirm} disabled={busy} className={cn(btn, 'bg-night text-brand hover:bg-surface')}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Confirmar
        </button>
      )}
      {a.whatsappToClient && (
        <a href={a.whatsappToClient} target="_blank" rel="noreferrer" className={cn(btn, 'bg-[#25D366]/15 text-[#128C4A] hover:bg-[#25D366]/25')}>
          <MessageCircle className="h-3.5 w-3.5" /> Avisar cliente
        </a>
      )}
      {canCancel && (
        <button onClick={onCancel} disabled={busy} className={cn(btn, 'text-red-700 hover:bg-red-50')} aria-label={`Cancelar agendamento de ${a.clientName}`}>
          <X className="h-3.5 w-3.5" /> Cancelar
        </button>
      )}
    </div>
  )
}
