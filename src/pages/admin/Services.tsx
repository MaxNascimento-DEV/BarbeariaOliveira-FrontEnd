import { useEffect, useState } from 'react'
import { Clock, DollarSign, Plus, Tag } from 'lucide-react'
import { Button, Card, CardHeader, Input, Modal, SERVICE_ICON_OPTIONS, ServiceIcon, Switch, useToast } from '../../components/ui'
import { DataTable } from '../../components/admin/DataTable'
import { useAppStore } from '../../store/AppStore'
import { formatBRL, formatDuration } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Service } from '../../types'
import { PageHeader } from './AdminLayout'
import { SERVICE_CATEGORIES } from '../../data/mock'

type Draft = Omit<Service, 'id' | 'price' | 'duration'> & { id?: string; price: string; duration: string }
const EMPTY: Draft = { name: '', description: '', price: '', duration: '30', icon: 'scissors', category: 'cabelo', active: true }

export default function Services() {
  const { services, saveService, toggleService } = useAppStore()
  const toast = useToast()
  const [editing, setEditing] = useState<Draft | null>(null)

  const toggle = async (id: string, active: boolean, name: string) => {
    try {
      await toggleService(id)
      toast.info(active ? 'Serviço desativado' : 'Serviço ativado', name)
    } catch (err) {
      toast.error('Não foi possível alterar', (err as Error).message)
    }
  }

  return (
    <>
      <PageHeader
        title="Serviços"
        subtitle={`${services.filter((s) => s.active).length} serviços disponíveis no site`}
        action={
          <Button variant="brand" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ ...EMPTY })}>
            Novo Serviço
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-night">Menu de serviços</h2>
        </CardHeader>
        <DataTable
          rows={services}
          rowKey={(s) => s.id}
          dim={(s) => !s.active}
          onEdit={(s) => setEditing({ ...s, price: String(s.price), duration: String(s.duration) })}
          columns={[
            {
              header: 'Serviço',
              cell: (s) => (
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-mint text-brand-dark">
                    <ServiceIcon name={s.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{s.name}</p>
                    <p className="max-w-xs truncate text-xs text-ink/50">{s.description}</p>
                  </div>
                </div>
              ),
            },
            { header: 'Categoria', cell: (s) => <span className="text-ink/70">{SERVICE_CATEGORIES.find((c) => c.value === s.category)?.label ?? '—'}</span> },
            { header: 'Preço', cell: (s) => <span className="font-semibold text-brand-dark">{formatBRL(s.price)}</span> },
            { header: 'Duração', cell: (s) => <span className="text-ink/70">{formatDuration(s.duration)}</span> },
            {
              header: 'Status',
              cell: (s) => (
                <Switch
                  size="sm"
                  checked={s.active}
                  label={s.active ? 'Ativo' : 'Inativo'}
                  onChange={() => toggle(s.id, s.active, s.name)}
                />
              ),
            },
          ]}
          mobile={(s) => (
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-mint text-brand-dark">
                <ServiceIcon name={s.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{s.name}</p>
                <p className="text-xs text-ink/50">
                  {formatBRL(s.price)} · {formatDuration(s.duration)}
                </p>
              </div>
              <Switch
                size="sm"
                checked={s.active}
                ariaLabel={`Serviço ativo: ${s.name}`}
                onChange={() => toggle(s.id, s.active, s.name)}
              />
            </div>
          )}
        />
      </Card>

      <ServiceForm
        draft={editing}
        onClose={() => setEditing(null)}
        onSave={async (svc) => {
          try {
            await saveService(svc)
            toast.success(svc.id ? 'Serviço atualizado' : 'Serviço cadastrado', svc.name)
            setEditing(null)
          } catch (err) {
            toast.error('Não foi possível salvar', (err as Error).message)
          }
        }}
      />
    </>
  )
}

function ServiceForm({
  draft,
  onClose,
  onSave,
}: {
  draft: Draft | null
  onClose: () => void
  onSave: (s: Omit<Service, 'id'> & { id?: string }) => Promise<void>
}) {
  const [form, setForm] = useState<Draft>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (draft) {
      setForm(draft)
      setErrors({})
    }
  }, [draft])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const submit = async () => {
    const price = Number(form.price.replace(',', '.'))
    const duration = Number(form.duration)
    const next: typeof errors = {}
    if (form.name.trim().length < 3) next.name = 'Informe o nome do serviço.'
    if (!(price > 0)) next.price = 'Preço inválido.'
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) next.duration = 'Entre 5 e 480 minutos.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await onSave({ ...form, name: form.name.trim(), price, duration })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!draft}
      onClose={() => !saving && onClose()}
      title={draft?.id ? 'Editar serviço' : 'Novo serviço'}
      description="Serviços ativos aparecem no site e no agendamento."
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit} loading={saving} loadingText="Salvando...">
            Salvar
          </Button>
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Input label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} icon={<Tag className="h-4 w-4" />} placeholder="Ex.: Corte Clássico" />
        <Input label="Descrição" value={form.description} maxLength={255} onChange={(e) => set('description', e.target.value)} placeholder="Uma linha sobre o ritual" />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Preço (R$)"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set('price', e.target.value.replace(/[^\d,.]/g, ''))}
            error={errors.price}
            icon={<DollarSign className="h-4 w-4" />}
            placeholder="75,00"
          />
          <Input
            label="Duração (min)"
            inputMode="numeric"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value.replace(/\D/g, ''))}
            error={errors.duration}
            icon={<Clock className="h-4 w-4" />}
            placeholder="45"
          />
        </div>
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/80">Categoria</legend>
          <div className="grid grid-cols-3 gap-2">
            {SERVICE_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-pressed={form.category === c.value}
                onClick={() => set('category', c.value)}
                className={cn(
                  'h-11 rounded-md border text-sm font-semibold transition',
                  form.category === c.value ? 'border-night bg-night text-brand' : 'border-ink/15 bg-white text-ink/80 hover:bg-mint',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/80">Ícone</p>
          <div className="grid grid-cols-6 gap-2">
            {SERVICE_ICON_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                title={o.label}
                aria-label={o.label}
                aria-pressed={form.icon === o.value}
                onClick={() => set('icon', o.value)}
                className={cn(
                  'grid h-11 place-items-center rounded-md border transition',
                  form.icon === o.value ? 'border-brand bg-night text-brand' : 'border-ink/15 bg-white text-brand-dark hover:bg-mint',
                )}
              >
                <ServiceIcon name={o.value} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-4">
          <div>
            <p className="text-sm font-semibold">Serviço ativo</p>
            <p className="text-xs text-ink/50">Inativos ficam ocultos para os clientes.</p>
          </div>
          <Switch checked={form.active} onChange={(v) => set('active', v)} />
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
