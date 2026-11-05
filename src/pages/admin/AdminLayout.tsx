import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BellRing, CalendarDays, Clock, ExternalLink, KeyRound, LogOut, Menu, Scissors, ShieldCheck, Users, Volume2, VolumeX, X } from 'lucide-react'
import { Logo } from '../../components/ui'
import { useAppStore } from '../../store/AppStore'
import { cn } from '../../lib/cn'
import { useNewAppointmentAlerts, type AppointmentAlerts } from '../../lib/useNewAppointmentAlerts'

type NavItem = { to: string; label: string; icon: typeof CalendarDays; end?: boolean }

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Agenda do dia', icon: CalendarDays, end: true },
  { to: '/admin/barbeiros', label: 'Barbeiros', icon: Users },
  { to: '/admin/servicos', label: 'Serviços', icon: Scissors },
  { to: '/admin/horarios', label: 'Horários', icon: Clock },
  { to: '/admin/usuarios', label: 'Usuários', icon: ShieldCheck },
]

const BARBER_NAV: NavItem[] = [
  { to: '/admin', label: 'Minha agenda', icon: CalendarDays, end: true },
  { to: '/admin/horarios', label: 'Meus horários', icon: Clock },
]

/** Páginas que só o admin pode abrir. */
const ADMIN_ONLY = ['/admin/barbeiros', '/admin/servicos', '/admin/usuarios']

function SidebarContent({ onNavigate, mobile, alerts }: { onNavigate?: () => void; mobile?: boolean; alerts: AppointmentAlerts }) {
  const { logout, user, isAdmin } = useAppStore()
  // Com senha provisória, o menu fica vazio até trocar a senha
  const nav = user?.mustChangePassword ? [] : isAdmin ? ADMIN_NAV : BARBER_NAV
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7">
        <Logo />
      </div>
      {user && (
        <div className="mx-3 mb-5 rounded-md bg-surface/60 px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-paper">{user.name}</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-brand">{user.role === 'ADMIN' ? 'Admin' : 'Barbeiro'}</p>
        </div>
      )}
      <p className="px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-paper/35">{isAdmin ? 'Gestão' : 'Meu painel'}</p>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-surface text-paper' : 'text-paper/60 hover:bg-surface/50 hover:text-paper',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId={mobile ? 'nav-active-mobile' : 'nav-active'} className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" />}
                <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-brand')} />
                {label}
                {end && alerts.unread > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-night" aria-label={`${alerts.unread} novos`}>
                    {alerts.unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-paper/10 p-3">
        {alerts.permission === 'default' && (
          <button
            onClick={alerts.requestPermission}
            className="flex w-full items-center gap-3 rounded-md bg-brand/10 px-3 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/20"
          >
            <BellRing className="h-[18px] w-[18px]" /> Ativar notificações
          </button>
        )}
        {alerts.permission === 'granted' && (
          <p className="flex items-center gap-3 px-3 py-2 text-xs text-paper/45">
            <Bell className="h-4 w-4 text-brand" /> Notificações ativas
          </p>
        )}
        <button
          onClick={() => {
            alerts.toggleSound()
            if (!alerts.soundOn) setTimeout(alerts.playChime, 50)
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-paper/60 transition hover:bg-surface/50 hover:text-paper"
        >
          {alerts.soundOn ? <Volume2 className="h-[18px] w-[18px]" /> : <VolumeX className="h-[18px] w-[18px]" />}
          {alerts.soundOn ? 'Som de aviso ligado' : 'Som de aviso desligado'}
        </button>
        <NavLink
          to="/admin/trocar-senha"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-paper/60 transition hover:bg-surface/50 hover:text-paper"
        >
          <KeyRound className="h-[18px] w-[18px]" /> Alterar senha
        </NavLink>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-paper/60 transition hover:bg-surface/50 hover:text-paper"
        >
          <ExternalLink className="h-[18px] w-[18px]" /> Ver site
        </a>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-paper/60 transition hover:bg-surface/50 hover:text-paper"
        >
          <LogOut className="h-[18px] w-[18px]" /> Sair
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, isAdmin } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const alerts = useNewAppointmentAlerts()

  // Zera o contador quando a Agenda do dia está aberta E a aba está visível
  const { clearUnread } = alerts
  useEffect(() => {
    const onAgenda = location.pathname === '/admin' || location.pathname === '/admin/'
    const check = () => {
      if (onAgenda && !document.hidden) clearUnread()
    }
    check()
    document.addEventListener('visibilitychange', check)
    return () => document.removeEventListener('visibilitychange', check)
  }, [location.pathname, alerts.unread, clearUnread])

  if (!user) return <Navigate to="/admin/login" replace />
  // Senha provisória: só a tela de troca de senha
  if (user.mustChangePassword && location.pathname !== '/admin/trocar-senha') return <Navigate to="/admin/trocar-senha" replace />
  // Barbeiro tentando abrir página de admin
  if (!isAdmin && ADMIN_ONLY.some((p) => location.pathname.startsWith(p))) return <Navigate to="/admin" replace />

  return (
    <div className="min-h-[100svh] bg-paper lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-night lg:block">
        <SidebarContent alerts={alerts} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-night px-4 py-3 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-full text-paper hover:bg-white/10"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {/* Backdrop and drawer are direct, keyed children so AnimatePresence always removes them after closing.
            A plain wrapper div here never finished its exit and left an invisible layer blocking every tap. */}
        {mobileOpen && (
          <motion.div
            key="drawer-backdrop"
            aria-hidden
            className="fixed inset-0 z-50 bg-ink/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            onClick={() => setMobileOpen(false)}
          />
        )}
        {mobileOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%', pointerEvents: 'none' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-night shadow-lifted lg:hidden"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-5 grid h-11 w-11 place-items-center rounded-full text-paper/70 hover:bg-white/10"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent mobile alerts={alerts} onNavigate={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-night sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm capitalize-first text-ink/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
