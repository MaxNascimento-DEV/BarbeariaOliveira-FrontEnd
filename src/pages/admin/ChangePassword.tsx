import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { Button, Card, CardBody, Input, useToast } from '../../components/ui'
import { useAppStore } from '../../store/AppStore'
import { ApiError } from '../../lib/api'
import { PageHeader } from './AdminLayout'

export default function ChangePassword() {
  const { user, changePassword, logout } = useAppStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({})
  const [saving, setSaving] = useState(false)
  const firstAccess = !!user?.mustChangePassword

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const errs: typeof errors = {}
    if (!current) errs.current = firstAccess ? 'Informe a senha provisória.' : 'Informe a senha atual.'
    if (next.length < 8) errs.next = 'Mínimo de 8 caracteres.'
    else if (next.length > 72) errs.next = 'Máximo de 72 caracteres.'
    if (confirm !== next) errs.confirm = 'As senhas não conferem.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      await changePassword(current, next)
      toast.success('Senha alterada', firstAccess ? 'Pronto! Agora você já pode usar o painel.' : undefined)
      navigate('/admin', { replace: true })
    } catch (err) {
      const message = (err as Error).message
      if (err instanceof ApiError && /atual/i.test(message)) setErrors({ current: message })
      else if (err instanceof ApiError && err.fields?.novaSenha) setErrors({ next: err.fields.novaSenha })
      else toast.error('Não foi possível alterar', message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={firstAccess ? 'Defina sua senha' : 'Alterar senha'}
        subtitle={firstAccess ? 'Primeiro acesso: troque a senha provisória que você recebeu.' : 'Use pelo menos 8 caracteres.'}
      />
      <Card className="max-w-lg">
        <CardBody>
          {firstAccess && (
            <p className="mb-5 flex items-start gap-2 rounded-md bg-mint px-3 py-2.5 text-sm text-brand-dark">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Por segurança, a senha que o admin criou vale só para este primeiro login.
            </p>
          )}
          <form onSubmit={submit} noValidate className="space-y-4">
            <Input
              label={firstAccess ? 'Senha provisória' : 'Senha atual'}
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              error={errors.current}
              icon={<Lock className="h-4 w-4" />}
            />
            <Input
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              error={errors.next}
              hint="Mínimo de 8 caracteres."
              icon={<KeyRound className="h-4 w-4" />}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              icon={<KeyRound className="h-4 w-4" />}
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" variant="primary" loading={saving} loadingText="Salvando...">
                Salvar nova senha
              </Button>
              {firstAccess && (
                <Button type="button" variant="ghost" onClick={logout}>
                  Sair
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  )
}
