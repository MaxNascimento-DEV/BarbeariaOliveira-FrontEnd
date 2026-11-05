import { useEffect, useState } from 'react'
import { Phone, Plus, Send, User, Award } from 'lucide-react'
import { Avatar, Button, Card, CardHeader, Input, Modal, Switch, useToast } from '../../components/ui'
import { DataTable } from '../../components/admin/DataTable'
import { useAppStore } from '../../store/AppStore'
import { isValidPhone, maskPhone } from '../../lib/masks'
import type { Barber } from '../../types'
import { PageHeader } from './AdminLayout'

type Draft = Omit<Barber, 'id'> & { id?: string }
const EMPTY: Draft = { name: '', phone: '', specialty: '', photo: '', telegramChatId: '', active: true }

export default function Barbers() {
  const { barbers, saveBarber, toggleBarber } = useAppStore()
  const toast = useToast()
  const [editing, setEditing] = useState<Draft | null>(null)
  const activeCount = barbers.filter((b) => b.active).length

  const toggle = async (id: string, active: boolean, name: string) => {
    try {
      await toggleBarber(id)
      toast.info(active ? 'Barbeiro desativado' : 'Barbeiro ativado', name)
    } catch (err) {
      toast.error('Não foi possível alterar', (err as Error).message)
    }
  }

  return (
    <>
      <PageHeader
        title="Barbeiros"
        subtitle={`${activeCount} ativos de ${barbers.length} profissionais`}
        action={
          <Button variant="brand" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ ...EMPTY })}>
            Novo Barbeiro
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-night">Equipe</h2>
        </CardHeader>
        <DataTable
          rows={barbers}
          rowKey={(b) => b.id}
          onEdit={(b) => setEditing({ ...b })}
          dim={(b) => !b.active}
          columns={[
            {
              header: 'Profissional',
              cell: (b) => (
                <div className="flex items-center gap-3">
                  <Avatar name={b.name} src={b.photo} className="h-10 w-10 text-sm" />
                  <div>
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-xs text-ink/50">{b.specialty}</p>
                  </div>
                </div>
              ),
            },
            { header: 'Telefone', cell: (b) => <span className="tabular-nums text-ink/70">{b.phone}</span> },
            {
              header: 'Status',
              cell: (b) => (
                <Switch
                  size="sm"
                  checked={b.active}
                  label={b.active ? 'Ativo' : 'Inativo'}
                  onChange={() => toggle(b.id, b.active, b.name)}
                />
              ),
            },
          ]}
          mobile={(b) => (
            <div className="flex items-center gap-3">
              <Avatar name={b.name} src={b.photo} className="h-11 w-11 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.name}</p>
                <p className="text-xs tabular-nums text-ink/50">{b.phone}</p>
              </div>
              <Switch
                size="sm"
                checked={b.active}
                ariaLabel={`Disponível para agendamento: ${b.name}`}
                onChange={() => toggle(b.id, b.active, b.name)}
              />
            </div>
          )}
        />
      </Card>

      <BarberForm
        draft={editing}
        onClose={() => setEditing(null)}
        onSave={async (d) => {
          try {
            await saveBarber(d)
            toast.success(d.id ? 'Barbeiro atualizado' : 'Barbeiro cadastrado', d.name)
            setEditing(null)
          } catch (err) {
            toast.error('Não foi possível salvar', (err as Error).message)
          }
        }}
      />
    </>
  )
}

function BarberForm({ draft, onClose, onSave }: { draft: Draft | null; onClose: () => void; onSave: (d: Draft) => Promise<void> }) {
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
    const next: typeof errors = {}
    if (form.name.trim().length < 3) next.name = 'Informe o nome completo.'
    if (!isValidPhone(form.phone)) next.phone = 'Telefone inválido.'
    if (form.photo && !/^https?:\/\/.+/i.test(form.photo.trim())) next.photo = 'Use uma URL começando com http:// ou https://'
    if (form.telegramChatId && !/^-?\d{1,20}$/.test(form.telegramChatId.trim())) next.telegramChatId = 'Só números (o bot informa esse ID).'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await onSave({ ...form, name: form.name.trim(), specialty: form.specialty.trim() || 'Barbeiro' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!draft}
      onClose={() => !saving && onClose()}
      title={draft?.id ? 'Editar barbeiro' : 'Novo barbeiro'}
      description="Os barbeiros ativos aparecem no agendamento online."
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
        <Input label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} icon={<User className="h-4 w-4" />} placeholder="Ex.: Rafael Oliveira" />
        <Input
          label="Telefone"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => set('phone', maskPhone(e.target.value))}
          error={errors.phone}
          icon={<Phone className="h-4 w-4" />}
          placeholder="(81) 98765-4321"
        />
        <Input label="Especialidade" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} icon={<Award className="h-4 w-4" />} placeholder="Ex.: Fades & degradês" />
        <Input label="URL da foto (opcional)" value={form.photo ?? ''} onChange={(e) => set('photo', e.target.value)} error={errors.photo} placeholder="https://..." />
        <Input
          label="ID do Telegram (opcional)"
          inputMode="numeric"
          value={form.telegramChatId ?? ''}
          onChange={(e) => set('telegramChatId', e.target.value.replace(/[^\d-]/g, ''))}
          error={errors.telegramChatId}
          icon={<Send className="h-4 w-4" />}
          placeholder="Ex.: 123456789"
          hint="Para receber avisos de novos agendamentos: o barbeiro manda “oi” para o bot da barbearia no Telegram e ele responde com este número."
        />
        <div className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-4">
          <div>
            <p className="text-sm font-semibold">Disponível para agendamento</p>
            <p className="text-xs text-ink/50">Desative durante férias ou folgas.</p>
          </div>
          <Switch checked={form.active} onChange={(v) => set('active', v)} />
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
