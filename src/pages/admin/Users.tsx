import { useCallback, useEffect, useState } from 'react'
import { Copy, KeyRound, Loader2, Mail, Plus, RefreshCw, User, XCircle } from 'lucide-react'
import { Button, Card, CardHeader, Input, Modal, Switch, useToast } from '../../components/ui'
import { DataTable } from '../../components/admin/DataTable'
import { useAppStore } from '../../store/AppStore'
import { cn } from '../../lib/cn'
import type { AppUser, Role } from '../../types'
import { PageHeader } from './AdminLayout'

type Draft = { id?: string; name: string; email: string; role: Role; barberId: string | null; tempPassword: string }
const EMPTY: Draft = { name: '', email: '', role: 'BARBEIRO', barberId: null, tempPassword: '' }

/** Senha provisória legível (sem 0/O, 1/l), 10 caracteres. */
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const buf = new Uint32Array(10)
  crypto.getRandomValues(buf)
  return Array.from(buf, (n) => chars[n % chars.length]).join('')
}

const RoleBadge = ({ role }: { role: Role }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
      role === 'ADMIN' ? 'bg-night text-brand ring-night' : 'bg-mint text-brand-dark ring-brand-dark/20',
    )}
  >
    {role === 'ADMIN' ? 'Admin' : 'Barbeiro'}
  </span>
)

export default function Users() {
  const { listUsers, createUser, updateUser, setUserActive, resetUserPassword, user: me } = useAppStore()
  const toast = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Draft | null>(null)
  const [resetting, setResetting] = useState<AppUser | null>(null)
  /** Senha recém-criada/redefinida, mostrada uma vez para o admin repassar. */
  const [shownPassword, setShownPassword] = useState<{ name: string; email: string; password: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await listUsers())
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [listUsers])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (u: AppUser) => {
    try {
      await setUserActive(u.id, !u.active)
      toast.info(u.active ? 'Acesso desativado' : 'Acesso ativado', u.name)
      load()
    } catch (err) {
      toast.error('Não foi possível alterar', (err as Error).message)
    }
  }

  const isMe = (u: AppUser) => u.email.toLowerCase() === me?.email.toLowerCase()

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Logins do painel. Barbeiros veem só a própria agenda e os próprios horários."
        action={
          <Button variant="brand" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ ...EMPTY, tempPassword: generatePassword() })}>
            Novo Usuário
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-night">Acessos</h2>
          <Button variant="ghost" size="sm" onClick={load} leftIcon={<RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />}>
            Recarregar
          </Button>
        </CardHeader>
        {loading && !users.length ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-ink/55">
            <Loader2 className="h-5 w-5 animate-spin text-brand-dark" /> Carregando...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <XCircle aria-hidden className="h-8 w-8 text-red-600" />
            <p className="text-sm text-ink/70">{error}</p>
          </div>
        ) : (
          <DataTable
            rows={users}
            rowKey={(u) => u.id}
            dim={(u) => !u.active}
            onEdit={(u) => setEditing({ id: u.id, name: u.name, email: u.email, role: u.role, barberId: u.barberId, tempPassword: '' })}
            columns={[
              {
                header: 'Usuário',
                cell: (u) => (
                  <div>
                    <p className="font-semibold">
                      {u.name} {isMe(u) && <span className="text-xs font-normal text-ink/45">(você)</span>}
                    </p>
                    <p className="text-xs text-ink/50">{u.email}</p>
                  </div>
                ),
              },
              { header: 'Perfil', cell: (u) => <RoleBadge role={u.role} /> },
              { header: 'Barbeiro', cell: (u) => <span className="text-ink/70">{u.barberName ?? '—'}</span> },
              {
                header: 'Senha',
                cell: (u) => (
                  <div className="flex items-center gap-2">
                    {u.mustChangePassword && <span className="text-xs text-amber-700">provisória</span>}
                    <button onClick={() => setResetting(u)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:underline">
                      <KeyRound className="h-3.5 w-3.5" /> Redefinir
                    </button>
                  </div>
                ),
              },
              {
                header: 'Status',
                cell: (u) => <Switch size="sm" checked={u.active} disabled={isMe(u)} label={u.active ? 'Ativo' : 'Inativo'} onChange={() => toggle(u)} />,
              },
            ]}
            mobile={(u) => (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.name}</p>
                  <p className="truncate text-xs text-ink/50">
                    {u.role === 'ADMIN' ? 'Admin' : `Barbeiro · ${u.barberName ?? ''}`} · {u.email}
                  </p>
                  <button onClick={() => setResetting(u)} className="mt-1 text-xs font-semibold text-brand-dark">
                    Redefinir senha
                  </button>
                </div>
                <Switch size="sm" checked={u.active} disabled={isMe(u)} ariaLabel={`Acesso ativo: ${u.name}`} onChange={() => toggle(u)} />
              </div>
            )}
          />
        )}
      </Card>

      <UserForm
        draft={editing}
        users={users}
        onClose={() => setEditing(null)}
        onSave={async (d) => {
          if (d.id) {
            await updateUser(d.id, d)
            toast.success('Usuário atualizado', d.name)
          } else {
            await createUser(d)
            setShownPassword({ name: d.name, email: d.email, password: d.tempPassword })
          }
          setEditing(null)
          load()
        }}
      />

      <ResetPassword
        user={resetting}
        onClose={() => setResetting(null)}
        onConfirm={async (u, password) => {
          await resetUserPassword(u.id, password)
          setResetting(null)
          setShownPassword({ name: u.name, email: u.email, password })
          load()
        }}
      />

      <Modal
        open={!!shownPassword}
        onClose={() => setShownPassword(null)}
        title="Acesso pronto"
        description="Passe estes dados para a pessoa. A senha só aparece agora e vale para o primeiro login."
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShownPassword(null)}>
              Concluir
            </Button>
          </div>
        }
      >
        {shownPassword && (
          <div className="space-y-3">
            <div className="rounded-lg border border-ink/10 bg-white p-4 text-sm">
              <p className="text-ink/55">Endereço</p>
              <p className="font-semibold">{window.location.origin}/admin/login</p>
              <p className="mt-3 text-ink/55">E-mail</p>
              <p className="font-semibold">{shownPassword.email}</p>
              <p className="mt-3 text-ink/55">Senha provisória</p>
              <p className="font-mono text-lg font-bold tracking-wider text-night">{shownPassword.password}</p>
            </div>
            <Button
              variant="ghost"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={async () => {
                const text = `Acesso ao painel da Barbearia Oliveira\n${window.location.origin}/admin/login\nE-mail: ${shownPassword.email}\nSenha provisória: ${shownPassword.password}\n(No primeiro acesso você vai criar a sua senha.)`
                try {
                  await navigator.clipboard.writeText(text)
                  toast.success('Copiado', 'Cole no WhatsApp ou Telegram para enviar.')
                } catch {
                  toast.error('Não foi possível copiar', 'Selecione e copie manualmente.')
                }
              }}
            >
              Copiar mensagem
            </Button>
          </div>
        )}
      </Modal>
    </>
  )
}

function UserForm({
  draft,
  users,
  onClose,
  onSave,
}: {
  draft: Draft | null
  users: AppUser[]
  onClose: () => void
  onSave: (d: Draft) => Promise<void>
}) {
  const { barbers } = useAppStore()
  const toast = useToast()
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

  // Barbeiros que ainda não têm login (ou o do próprio usuário em edição)
  const takenBarbers = new Set(users.filter((u) => u.barberId && u.id !== form.id).map((u) => u.barberId))
  const availableBarbers = barbers.filter((b) => !takenBarbers.has(b.id))

  const submit = async () => {
    const next: typeof errors = {}
    if (form.name.trim().length < 2) next.name = 'Informe o nome.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'E-mail inválido.'
    if (form.role === 'BARBEIRO' && !form.barberId) next.barberId = 'Escolha o barbeiro.'
    if (!form.id && form.tempPassword.length < 8) next.tempPassword = 'Mínimo de 8 caracteres.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      toast.error('Não foi possível salvar', (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!draft}
      onClose={() => !saving && onClose()}
      title={draft?.id ? 'Editar usuário' : 'Novo usuário'}
      description={draft?.id ? 'Para trocar a senha, use "Redefinir" na lista.' : 'A pessoa troca a senha provisória no primeiro login.'}
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
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/80">Perfil</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['BARBEIRO', 'ADMIN'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={form.role === r}
                onClick={() => set('role', r)}
                className={cn(
                  'rounded-md border px-3 py-2.5 text-left transition',
                  form.role === r ? 'border-night bg-night text-paper' : 'border-ink/15 bg-white text-ink/80 hover:bg-mint',
                )}
              >
                <span className={cn('block text-sm font-semibold', form.role === r && 'text-brand')}>{r === 'ADMIN' ? 'Admin' : 'Barbeiro'}</span>
                <span className={cn('block text-xs', form.role === r ? 'text-paper/60' : 'text-ink/50')}>
                  {r === 'ADMIN' ? 'Acesso total ao painel' : 'Só a própria agenda e horários'}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {form.role === 'BARBEIRO' && (
          <div>
            <label htmlFor="user-barber" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/80">
              Barbeiro
            </label>
            <select
              id="user-barber"
              value={form.barberId ?? ''}
              onChange={(e) => {
                const id = e.target.value || null
                set('barberId', id)
                // Preenche o nome com o do barbeiro, se ainda estiver vazio
                const b = barbers.find((x) => x.id === id)
                if (b && !form.name.trim()) set('name', b.name)
              }}
              className={cn(
                'h-12 w-full rounded-md border bg-white px-3 text-sm text-night focus:outline-none focus:ring-2 focus:ring-brand/40',
                errors.barberId ? 'border-red-500' : 'border-ink/15',
              )}
            >
              <option value="">Selecione...</option>
              {availableBarbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.active ? '' : ' (inativo)'}
                </option>
              ))}
            </select>
            {errors.barberId && <p className="mt-1.5 text-xs text-red-600">{errors.barberId}</p>}
            {!availableBarbers.length && <p className="mt-1.5 text-xs text-ink/50">Todos os barbeiros já têm login. Cadastre o barbeiro primeiro em Barbeiros.</p>}
          </div>
        )}

        <Input label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} icon={<User className="h-4 w-4" />} />
        <Input
          label="E-mail (login)"
          type="email"
          autoComplete="off"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          placeholder="nome@exemplo.com"
        />
        {!form.id && (
          <div>
            <Input
              label="Senha provisória"
              value={form.tempPassword}
              onChange={(e) => set('tempPassword', e.target.value)}
              error={errors.tempPassword}
              icon={<KeyRound className="h-4 w-4" />}
              className="font-mono"
            />
            <button type="button" onClick={() => set('tempPassword', generatePassword())} className="mt-1.5 text-xs font-semibold text-brand-dark hover:underline">
              Gerar outra
            </button>
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

function ResetPassword({
  user,
  onClose,
  onConfirm,
}: {
  user: AppUser | null
  onClose: () => void
  onConfirm: (u: AppUser, password: string) => Promise<void>
}) {
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) setPassword(generatePassword())
  }, [user])

  return (
    <Modal
      open={!!user}
      onClose={() => !saving && onClose()}
      title="Redefinir senha"
      description={user ? `${user.name} vai entrar com esta senha provisória e criar uma nova.` : undefined}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={saving}
            loadingText="Salvando..."
            onClick={async () => {
              if (!user) return
              if (password.length < 8) return toast.error('Senha curta', 'Mínimo de 8 caracteres.')
              setSaving(true)
              try {
                await onConfirm(user, password)
              } catch (err) {
                toast.error('Não foi possível redefinir', (err as Error).message)
              } finally {
                setSaving(false)
              }
            }}
          >
            Redefinir
          </Button>
        </div>
      }
    >
      <Input label="Nova senha provisória" value={password} onChange={(e) => setPassword(e.target.value)} icon={<KeyRound className="h-4 w-4" />} className="font-mono" />
      <button type="button" onClick={() => setPassword(generatePassword())} className="mt-1.5 text-xs font-semibold text-brand-dark hover:underline">
        Gerar outra
      </button>
    </Modal>
  )
}
