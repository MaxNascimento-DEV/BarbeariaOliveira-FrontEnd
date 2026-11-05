import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Loader2, RefreshCw, Save, UtensilsCrossed, XCircle } from 'lucide-react'
import { Avatar, Button, Card, CardHeader, Switch, useToast } from '../../components/ui'
import { useAppStore } from '../../store/AppStore'
import { cn } from '../../lib/cn'
import type { WeekDay, WorkingHours } from '../../types'
import { PageHeader } from './AdminLayout'

const DAYS: Array<{ value: WeekDay; label: string; short: string }> = [
  { value: 'SEGUNDA', label: 'Segunda-feira', short: 'Seg' },
  { value: 'TERCA', label: 'Terça-feira', short: 'Ter' },
  { value: 'QUARTA', label: 'Quarta-feira', short: 'Qua' },
  { value: 'QUINTA', label: 'Quinta-feira', short: 'Qui' },
  { value: 'SEXTA', label: 'Sexta-feira', short: 'Sex' },
  { value: 'SABADO', label: 'Sábado', short: 'Sáb' },
  { value: 'DOMINGO', label: 'Domingo', short: 'Dom' },
]

interface Row {
  enabled: boolean
  open: string
  close: string
  lunch: boolean
  lunchStart: string
  lunchEnd: string
}

type Week = Record<WeekDay, Row>

const DEFAULT_ROW: Row = { enabled: false, open: '09:00', close: '18:00', lunch: true, lunchStart: '12:00', lunchEnd: '13:00' }

function toWeek(list: WorkingHours[]): Week {
  const week = {} as Week
  for (const d of DAYS) {
    const h = list.find((x) => x.day === d.value)
    week[d.value] = h
      ? {
          enabled: true,
          open: h.open,
          close: h.close,
          lunch: !!h.lunchStart,
          lunchStart: h.lunchStart ?? DEFAULT_ROW.lunchStart,
          lunchEnd: h.lunchEnd ?? DEFAULT_ROW.lunchEnd,
        }
      : { ...DEFAULT_ROW }
  }
  return week
}

/** Mesmas regras do HorarioTrabalhoRequest no backend, para avisar antes de enviar. */
function validate(r: Row): string | null {
  if (!r.enabled) return null
  if (!r.open || !r.close) return 'Informe abertura e fechamento.'
  if (r.close <= r.open) return 'O fechamento deve ser depois da abertura.'
  if (r.lunch) {
    if (!r.lunchStart || !r.lunchEnd) return 'Informe início e fim do almoço.'
    if (r.lunchEnd <= r.lunchStart) return 'O fim do almoço deve ser depois do início.'
    if (r.lunchStart < r.open || r.lunchEnd > r.close) return 'O almoço tem que ser dentro do expediente.'
  }
  return null
}

const same = (a: Row, b: Row) =>
  a.enabled === b.enabled &&
  (!a.enabled ||
    (a.open === b.open &&
      a.close === b.close &&
      a.lunch === b.lunch &&
      (!a.lunch || (a.lunchStart === b.lunchStart && a.lunchEnd === b.lunchEnd))))

export default function WorkingHoursPage() {
  const { barbers, listWorkingHours, saveWorkingHours, removeWorkingHours, isAdmin, user } = useAppStore()
  // Barbeiro logado: edita só os próprios horários (sem escolher barbeiro)
  const ownBarberId = !isAdmin ? user?.barberId ?? null : null
  const toast = useToast()
  const [barberId, setBarberId] = useState<string | null>(null)
  const [saved, setSaved] = useState<Week | null>(null)
  const [week, setWeek] = useState<Week | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Seleciona o primeiro barbeiro assim que a lista chega
  useEffect(() => {
    if (ownBarberId) setBarberId(ownBarberId)
    else if (!barberId && barbers.length) setBarberId(barbers[0].id)
  }, [barbers, barberId, ownBarberId])

  const load = useCallback(async () => {
    if (!barberId) return
    setLoading(true)
    setError(null)
    try {
      const w = toWeek(await listWorkingHours(barberId))
      setSaved(w)
      setWeek(w)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [barberId, listWorkingHours])

  useEffect(() => {
    load()
  }, [load])

  const errors = useMemo(() => {
    const out: Partial<Record<WeekDay, string>> = {}
    if (week) for (const d of DAYS) {
      const e = validate(week[d.value])
      if (e) out[d.value] = e
    }
    return out
  }, [week])

  const dirty = useMemo(() => !!week && !!saved && DAYS.some((d) => !same(week[d.value], saved[d.value])), [week, saved])

  const update = (day: WeekDay, patch: Partial<Row>) => setWeek((w) => (w ? { ...w, [day]: { ...w[day], ...patch } } : w))

  const copyMondayToWeekdays = () => {
    if (!week) return
    const mon = week.SEGUNDA
    setWeek({ ...week, TERCA: { ...mon }, QUARTA: { ...mon }, QUINTA: { ...mon }, SEXTA: { ...mon } })
  }

  const barber = barbers.find((b) => b.id === barberId)

  const save = async () => {
    if (!week || !saved || !barberId) return
    if (Object.keys(errors).length) {
      toast.error('Confira os horários', 'Há dias com horário inválido.')
      return
    }
    setSaving(true)
    let failures = 0
    for (const d of DAYS) {
      const now = week[d.value]
      const before = saved[d.value]
      if (same(now, before)) continue
      try {
        if (now.enabled) {
          await saveWorkingHours(barberId, {
            day: d.value,
            open: now.open,
            close: now.close,
            lunchStart: now.lunch ? now.lunchStart : null,
            lunchEnd: now.lunch ? now.lunchEnd : null,
          })
        } else if (before.enabled) {
          await removeWorkingHours(barberId, d.value)
        }
      } catch (err) {
        failures++
        toast.error(`Erro em ${d.label}`, (err as Error).message)
      }
    }
    setSaving(false)
    if (!failures) toast.success('Horários salvos', barber?.name ?? user?.name)
    await load()
  }

  return (
    <>
      <PageHeader
        title={ownBarberId ? 'Meus horários' : 'Horários de trabalho'}
        subtitle={ownBarberId ? 'Os dias e horários em que você atende pelo site.' : 'Define a grade que aparece no agendamento online de cada barbeiro.'}
        action={
          <Button variant="brand" leftIcon={<Save className="h-4 w-4" />} onClick={save} loading={saving} loadingText="Salvando..." disabled={!dirty}>
            Salvar alterações
          </Button>
        }
      />

      {/* Seleção do barbeiro (só admin) */}
      <div className={cn("no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1", ownBarberId && "hidden")}>
        {barbers.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              if (dirty && !saving) toast.info('Alterações descartadas', 'Os horários não salvos foram descartados.')
              setBarberId(b.id)
            }}
            aria-pressed={b.id === barberId}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-semibold transition',
              b.id === barberId ? 'border-night bg-night text-paper' : 'border-ink/15 bg-white text-ink/80 hover:bg-mint',
              !b.active && 'opacity-60',
            )}
          >
            <Avatar name={b.name} src={b.photo} className="h-8 w-8 text-xs" />
            {b.name.split(' ')[0]}
            {!b.active && <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">inativo</span>}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <h2 className="font-display text-lg font-semibold text-night">{barber?.name ?? (ownBarberId ? user?.name : 'Selecione um barbeiro')}</h2>
            <p className="text-xs text-ink/50">Dias desligados aparecem como folga no site.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyMondayToWeekdays} disabled={!week} leftIcon={<Copy className="h-4 w-4" />}>
              Copiar segunda para ter–sex
            </Button>
            <Button variant="ghost" size="sm" onClick={load} disabled={!barberId || loading} leftIcon={<RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />}>
              Recarregar
            </Button>
          </div>
        </CardHeader>

        {!barbers.length && !ownBarberId ? (
          <p className="px-6 py-16 text-center text-sm text-ink/55">Cadastre um barbeiro primeiro.</p>
        ) : loading && !week ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-ink/55">
            <Loader2 className="h-5 w-5 animate-spin text-brand-dark" /> Carregando horários...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <XCircle aria-hidden className="h-8 w-8 text-red-600" />
            <p className="text-sm text-ink/70">{error}</p>
          </div>
        ) : week ? (
          <ul className="divide-y divide-ink/5">
            {DAYS.map((d) => {
              const r = week[d.value]
              const err = errors[d.value]
              return (
                <li key={d.value} className={cn('px-5 py-4 sm:px-6', !r.enabled && 'bg-ink/[0.02]')}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex w-full items-center justify-between gap-3 lg:w-52">
                      <span className="font-semibold text-night">
                        <span className="sm:hidden">{d.short}</span>
                        <span className="hidden sm:inline">{d.label}</span>
                      </span>
                      <Switch size="sm" checked={r.enabled} label={r.enabled ? 'Atende' : 'Folga'} onChange={(v) => update(d.value, { enabled: v })} />
                    </div>

                    {r.enabled && (
                      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3">
                        <TimeRange label="Expediente" from={r.open} to={r.close} onFrom={(v) => update(d.value, { open: v })} onTo={(v) => update(d.value, { close: v })} />
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => update(d.value, { lunch: !r.lunch })}
                            aria-pressed={r.lunch}
                            className={cn(
                              'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition',
                              r.lunch ? 'border-brand-dark/30 bg-mint text-brand-dark' : 'border-ink/15 text-ink/50 hover:bg-mint',
                            )}
                          >
                            <UtensilsCrossed className="h-3.5 w-3.5" /> {r.lunch ? 'Almoço' : 'Sem almoço'}
                          </button>
                          {r.lunch && (
                            <TimeRange
                              label="Almoço"
                              hideLabel
                              from={r.lunchStart}
                              to={r.lunchEnd}
                              onFrom={(v) => update(d.value, { lunchStart: v })}
                              onTo={(v) => update(d.value, { lunchEnd: v })}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {err && <p className="mt-2 text-xs text-red-600 lg:pl-52">{err}</p>}
                </li>
              )
            })}
          </ul>
        ) : null}
      </Card>
    </>
  )
}

function TimeRange({
  label,
  hideLabel,
  from,
  to,
  onFrom,
  onTo,
}: {
  label: string
  hideLabel?: boolean
  from: string
  to: string
  onFrom: (v: string) => void
  onTo: (v: string) => void
}) {
  const input = 'h-9 rounded-md border border-ink/15 bg-white px-2 text-sm tabular-nums text-night focus:border-brand-dark focus:outline-none'
  return (
    <div className="flex items-center gap-2">
      {!hideLabel && <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/80">{label}</span>}
      <input type="time" step={1800} aria-label={`${label} — início`} value={from} onChange={(e) => onFrom(e.target.value)} className={input} />
      <span className="text-ink/40">até</span>
      <input type="time" step={1800} aria-label={`${label} — fim`} value={to} onChange={(e) => onTo(e.target.value)} className={input} />
    </div>
  )
}
