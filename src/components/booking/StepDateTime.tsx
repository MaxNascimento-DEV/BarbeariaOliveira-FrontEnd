import { useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarX2, ChevronLeft, ChevronRight, Loader2, Moon, Sun, Sunrise } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatLongDate, toISODate } from '../../lib/format'

interface Props {
  date: string | null
  time: string | null
  onDate: (iso: string) => void
  onTime: (time: string) => void
  slots: { time: string; available: boolean }[]
  /** Buscando horários na API */
  loading?: boolean
  /** Motivo vindo da API quando não há horários (ex.: "O barbeiro não atende neste dia.") */
  emptyMessage?: string | null
}

// O backend aceita até 30 dias de antecedência (barbearia.dias-maximos-antecedencia)
const DAYS_AHEAD = 30

function buildDays() {
  const out: { iso: string; weekday: string; day: string; month: string }[] = []
  const base = new Date()
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    out.push({
      iso: toISODate(d),
      weekday: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      day: String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    })
  }
  return out
}

const PERIODS = [
  { key: 'manha', label: 'Manhã', icon: Sunrise, test: (h: number) => h < 12 },
  { key: 'tarde', label: 'Tarde', icon: Sun, test: (h: number) => h >= 12 && h < 18 },
  { key: 'noite', label: 'Noite', icon: Moon, test: (h: number) => h >= 18 },
]

export function StepDateTime({ date, time, onDate, onTime, slots, loading, emptyMessage }: Props) {
  const days = useMemo(buildDays, [])
  const scroller = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })
  const anyAvailable = slots.some((s) => s.available)

  return (
    <div className="space-y-7">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/80">Data</h3>
          <div className="hidden gap-1 sm:flex">
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => scroll(dir as 1 | -1)}
                aria-label={dir < 0 ? 'Datas anteriores' : 'Próximas datas'}
                className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 text-brand-dark transition hover:bg-mint"
              >
                {dir < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
        <div ref={scroller} className="no-scrollbar -mx-5 flex snap-x gap-2.5 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-2 sm:-mx-7 sm:scroll-px-7 sm:px-7">
          {days.map((d) => {
            const selected = d.iso === date
            return (
              <button
                key={d.iso}
                type="button"
                aria-label={formatLongDate(d.iso)}
                onClick={() => onDate(d.iso)}
                aria-pressed={selected}
                className={cn(
                  'flex w-[68px] shrink-0 snap-start flex-col items-center rounded-lg border py-3 transition-all duration-200',
                  selected
                    ? 'border-night bg-night text-paper shadow-lifted'
                    : 'border-ink/10 bg-white text-ink hover:border-brand/60',
                )}
              >
                <span className={cn('text-[11px] font-semibold uppercase tracking-wide', selected ? 'text-brand' : 'text-ink/50')}>
                  {d.weekday}
                </span>
                <span className="mt-1 font-display text-xl font-semibold leading-none">{d.day}</span>
                <span className={cn('mt-1 text-[11px] capitalize', selected ? 'text-paper/70' : 'text-ink/45')}>
                  {d.month}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/80">Horário</h3>
        <AnimatePresence mode="wait">
          {!date ? (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/50">
              Selecione uma data para ver os horários disponíveis.
            </motion.p>
          ) : loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/55">
              <Loader2 aria-hidden className="h-4 w-4 animate-spin text-brand-dark" />
              Buscando horários disponíveis...
            </motion.div>
          ) : !anyAvailable ? (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/55">
              <CalendarX2 aria-hidden className="h-6 w-6 text-brand-dark" />
              {emptyMessage ?? 'Não há horários livres nesta data.'} Que tal outro dia?
            </motion.div>
          ) : (
            <motion.div key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              {PERIODS.map((p) => {
                const list = slots.filter((s) => p.test(Number(s.time.slice(0, 2))))
                if (!list.length) return null
                const Icon = p.icon
                return (
                  <div key={p.key}>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink/60">
                      <Icon aria-hidden className="h-4 w-4 text-brand-dark" /> {p.label}
                    </p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {list.map((s) => {
                        const selected = s.time === time
                        return (
                          <button
                            key={s.time}
                            type="button"
                            disabled={!s.available}
                            onClick={() => onTime(s.time)}
                            aria-pressed={selected}
                            className={cn(
                              'h-11 rounded-md border text-sm font-semibold tabular-nums transition-all duration-150',
                              selected
                                ? 'border-brand bg-brand text-night shadow-[0_4px_14px_-4px_rgba(93,214,44,0.8)]'
                                : s.available
                                  ? 'border-ink/15 bg-white text-brand-dark hover:border-ink hover:bg-mint'
                                  : 'cursor-not-allowed border-transparent bg-ink/[0.04] text-ink/25 line-through',
                            )}
                          >
                            {s.time}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
