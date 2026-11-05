import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Mail } from 'lucide-react'
import { Button, Input, LogoMark, useToast } from '../../components/ui'
import { useAppStore } from '../../store/AppStore'

export default function AdminLogin() {
  const { user, login } = useAppStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to={user.mustChangePassword ? '/admin/trocar-senha' : '/admin'} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!email || !password) return setError('Preencha e-mail e senha.')
    setError(null)
    setLoading(true)
    try {
      const session = await login(email, password)
      if (session.mustChangePassword) {
        toast.info('Defina sua senha', 'No primeiro acesso, troque a senha provisória.')
        navigate('/admin/trocar-senha', { replace: true })
      } else {
        toast.success(`Olá, ${session.name.split(' ')[0]}`, 'Login realizado com sucesso.')
        navigate('/admin', { replace: true })
      }
    } catch (err) {
      setError((err as Error).message)
      toast.error('Falha no login', (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-night px-5 py-12">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-surface blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-36" />
          <h1 className="mt-5 font-display text-2xl font-semibold text-paper">Área restrita</h1>
          <p className="mt-1 text-sm text-paper/60">Painel da Oliveira Barbearia — admin e barbeiros</p>
        </div>

        <form onSubmit={submit} noValidate className="space-y-5 rounded-xl bg-paper p-7 shadow-lifted sm:p-9">
          <Input
            label="E-mail"
            type="email"
            autoComplete="username"
            placeholder="voce@oliveira.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            error={error ?? undefined}
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} loadingText="Entrando...">
            Entrar
          </Button>
        </form>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-paper/60 transition hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
      </motion.div>
    </div>
  )
}
