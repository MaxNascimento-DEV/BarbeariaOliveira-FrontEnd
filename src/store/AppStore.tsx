import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Appointment, AppointmentStatus, AppUser, Barber, Role, Service, ServiceCategory, ServiceIcon, SessionUser, WeekDay, WorkingHours } from '../types'
import { api, ApiError, hhmm, setUnauthorizedHandler, tokenStore } from '../lib/api'

/* ------------------------------------------------------------------ */
/* Formatos da API (DTOs do Spring Boot)                               */
/* ------------------------------------------------------------------ */

interface ServicoResponse {
  id: number
  nome: string
  valor: number
  duracaoMinutos: number
  descricao: string | null
  icone: string | null
  categoria: string | null
  ativo: boolean
}

interface BarbeiroResponse {
  id: number
  nome: string
  especialidade: string | null
  telefone?: string
  fotoUrl: string | null
  telegramChatId?: string | null
  ativo?: boolean
}

type StatusApi = 'AGENDADO' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'

interface AgendamentoResponse {
  id: number
  servicoId: number
  nomeServico: string
  barbeiroId: number
  nomeBarbeiro: string
  nomeCliente: string
  telefoneCliente: string
  dataHoraInicio: string // 2026-11-04T09:00:00
  dataHoraFim: string
  valorCobrado: number
  status: StatusApi
  linkWhatsAppBarbearia: string | null
  linkWhatsAppCliente: string | null
}

interface LoginResponse {
  token: string
  expiraEm: string
  nome: string
  email: string
  perfil: Role
  barbeiroId: number | null
  trocarSenha: boolean
}

interface UsuarioResponse {
  id: number
  nome: string
  email: string
  perfil: Role
  barbeiroId: number | null
  nomeBarbeiro: string | null
  ativo: boolean
  trocarSenha: boolean
}

interface HorarioTrabalhoResponse {
  diaSemana: WeekDay
  horaAbertura: string
  horaFechamento: string
  almocoInicio: string | null
  almocoFim: string | null
}

/* ------------------------------------------------------------------ */
/* Conversores API → front                                             */
/* ------------------------------------------------------------------ */

const ICONS: ServiceIcon[] = ['scissors', 'beard', 'combo', 'razor', 'spa', 'color']
const CATEGORIES: ServiceCategory[] = ['cabelo', 'barba', 'cuidados']

const STATUS_FROM_API: Record<StatusApi, AppointmentStatus> = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'finalizado',
  CANCELADO: 'cancelado',
}

const toService = (s: ServicoResponse): Service => ({
  id: String(s.id),
  name: s.nome,
  description: s.descricao ?? '',
  price: Number(s.valor),
  duration: s.duracaoMinutos,
  icon: ICONS.includes(s.icone as ServiceIcon) ? (s.icone as ServiceIcon) : 'scissors',
  category: CATEGORIES.includes(s.categoria as ServiceCategory) ? (s.categoria as ServiceCategory) : 'cabelo',
  active: s.ativo ?? true,
})

const toBarber = (b: BarbeiroResponse): Barber => ({
  id: String(b.id),
  name: b.nome,
  phone: b.telefone ? formatPhone(b.telefone) : '',
  specialty: b.especialidade ?? '',
  photo: b.fotoUrl ?? undefined,
  telegramChatId: b.telegramChatId ?? '',
  active: b.ativo ?? true,
})

const toAppointment = (a: AgendamentoResponse): Appointment => ({
  id: String(a.id),
  clientName: a.nomeCliente,
  clientPhone: formatPhone(a.telefoneCliente ?? ''),
  serviceId: String(a.servicoId),
  serviceName: a.nomeServico,
  barberId: String(a.barbeiroId),
  barberName: a.nomeBarbeiro,
  date: a.dataHoraInicio.slice(0, 10),
  time: hhmm(a.dataHoraInicio.slice(11)),
  endTime: hhmm(a.dataHoraFim.slice(11)),
  price: Number(a.valorCobrado),
  status: STATUS_FROM_API[a.status] ?? 'agendado',
  whatsappToBarbershop: a.linkWhatsAppBarbearia,
  whatsappToClient: a.linkWhatsAppCliente,
})

const toWorkingHours = (h: HorarioTrabalhoResponse): WorkingHours => ({
  day: h.diaSemana,
  open: hhmm(h.horaAbertura),
  close: hhmm(h.horaFechamento),
  lunchStart: h.almocoInicio ? hhmm(h.almocoInicio) : null,
  lunchEnd: h.almocoFim ? hhmm(h.almocoFim) : null,
})

const toSessionUser = (l: LoginResponse): SessionUser => ({
  name: l.nome,
  email: l.email,
  role: l.perfil,
  barberId: l.barbeiroId == null ? null : String(l.barbeiroId),
  mustChangePassword: !!l.trocarSenha,
})

const toAppUser = (u: UsuarioResponse): AppUser => ({
  id: String(u.id),
  name: u.nome,
  email: u.email,
  role: u.perfil,
  barberId: u.barbeiroId == null ? null : String(u.barbeiroId),
  barberName: u.nomeBarbeiro,
  active: u.ativo,
  mustChangePassword: u.trocarSenha,
})

/** "81987654321" → "(81) 98765-4321" (o backend guarda só dígitos). */
function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return raw
}

const onlyDigits = (v: string) => v.replace(/\D/g, '')
const emptyToNull = (v: string | undefined | null) => (v && v.trim() ? v.trim() : null)

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export { ApiError }

export interface Slot {
  time: string
  available: boolean
}

export interface NewAppointment {
  clientName: string
  clientPhone: string
  serviceId: string
  barberId: string
  date: string
  time: string
  recaptchaToken?: string
}

interface AppStore {
  services: Service[]
  barbers: Barber[]
  loading: boolean
  loadError: string | null
  reload: () => Promise<void>

  /** Quem está logado (null = ninguém). */
  user: SessionUser | null
  /** Admin com senha definitiva. */
  isAdmin: boolean
  /** Barbeiro com senha definitiva. */
  isBarber: boolean
  login: (email: string, password: string) => Promise<SessionUser>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>

  // Público
  getAvailableSlots: (barberId: string, serviceId: string, date: string) => Promise<Slot[]>
  createAppointment: (input: NewAppointment) => Promise<Appointment>

  // Admin — agenda
  listAppointments: (date: string) => Promise<Appointment[]>
  confirmAppointment: (id: string) => Promise<Appointment>
  cancelAppointment: (id: string) => Promise<Appointment>
  getLatestAppointmentId: () => Promise<number>
  listNewAppointments: (afterId: number) => Promise<Appointment[]>

  // Admin — cadastros
  saveService: (service: Omit<Service, 'id'> & { id?: string }) => Promise<void>
  saveBarber: (barber: Omit<Barber, 'id'> & { id?: string }) => Promise<void>
  toggleService: (id: string) => Promise<void>
  toggleBarber: (id: string) => Promise<void>

  // Admin — usuários (logins)
  listUsers: () => Promise<AppUser[]>
  createUser: (input: { name: string; email: string; role: Role; barberId: string | null; tempPassword: string }) => Promise<void>
  updateUser: (id: string, input: { name: string; email: string; role: Role; barberId: string | null }) => Promise<void>
  setUserActive: (id: string, active: boolean) => Promise<void>
  resetUserPassword: (id: string, tempPassword: string) => Promise<void>

  // Horários de trabalho (admin: qualquer barbeiro; barbeiro: só os dele)
  listWorkingHours: (barberId: string) => Promise<WorkingHours[]>
  saveWorkingHours: (barberId: string, hours: WorkingHours) => Promise<WorkingHours>
  removeWorkingHours: (barberId: string, day: WeekDay) => Promise<void>
}

const Ctx = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [user, setUser] = useState<SessionUser | null>(() => tokenStore.getUser<SessionUser>())
  const isAdmin = user?.role === 'ADMIN' && !user.mustChangePassword
  const isBarber = user?.role === 'BARBEIRO' && !user.mustChangePassword
  // Rotas da agenda/horários mudam conforme o perfil (o backend filtra o barbeiro pelo token)
  const agendaBase = isAdmin ? '/api/admin/agendamentos' : '/api/barbeiro/agendamentos'

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  const startSession = useCallback((res: LoginResponse) => {
    const session = toSessionUser(res)
    tokenStore.set(res.token, res.expiraEm)
    tokenStore.setUser(session)
    setUser(session)
    return session
  }, [])

  /** Admin vê todos (inclusive inativos); o site vê só os ativos. */
  const reload = useCallback(async () => {
    setLoadError(null)
    try {
      const admin = tokenStore.getUser<SessionUser>()?.role === 'ADMIN' && !tokenStore.getUser<SessionUser>()?.mustChangePassword
      const [svc, brb] = await Promise.all([
        api<ServicoResponse[]>('GET', admin ? '/api/admin/servicos' : '/api/public/servicos'),
        api<BarbeiroResponse[]>('GET', admin ? '/api/admin/barbeiros' : '/api/public/barbeiros'),
      ])
      setServices(svc.map(toService))
      setBarbers(brb.map(toBarber))
    } catch (err) {
      setLoadError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload, isAdmin])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await api<LoginResponse>('POST', '/api/public/auth/login', { email: email.trim(), senha: password })
        return startSession(res)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) throw new Error('E-mail ou senha inválidos.')
        throw err
      }
    },
    [startSession],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const res = await api<LoginResponse>('PUT', '/api/conta/senha', { senhaAtual: currentPassword, novaSenha: newPassword })
      startSession(res)
    },
    [startSession],
  )

  const getAvailableSlots = useCallback(async (barberId: string, serviceId: string, date: string) => {
    const qs = new URLSearchParams({ barbeiroId: barberId, servicoId: serviceId, data: date })
    const times = await api<string[]>('GET', `/api/public/agendamentos/disponibilidade?${qs}`)
    return times.map((t) => ({ time: hhmm(t), available: true }))
  }, [])

  const createAppointment = useCallback(async (input: NewAppointment) => {
    const res = await api<AgendamentoResponse>('POST', '/api/public/agendamentos', {
      servicoId: Number(input.serviceId),
      barbeiroId: Number(input.barberId),
      dataHoraInicio: `${input.date}T${input.time}:00`,
      nomeCliente: input.clientName,
      telefoneCliente: onlyDigits(input.clientPhone),
      recaptchaToken: input.recaptchaToken ?? null,
    })
    return toAppointment(res)
  }, [])

  const listAppointments = useCallback(
    async (date: string) => (await api<AgendamentoResponse[]>('GET', `${agendaBase}?data=${date}`)).map(toAppointment),
    [agendaBase],
  )

  const confirmAppointment = useCallback(
    async (id: string) => toAppointment(await api<AgendamentoResponse>('PATCH', `${agendaBase}/${id}/confirmar`)),
    [agendaBase],
  )

  const cancelAppointment = useCallback(
    async (id: string) => toAppointment(await api<AgendamentoResponse>('PATCH', `${agendaBase}/${id}/cancelar`)),
    [agendaBase],
  )

  const getLatestAppointmentId = useCallback(
    async () => (await api<{ id: number }>('GET', `${agendaBase}/ultimo-id`)).id ?? 0,
    [agendaBase],
  )

  const listNewAppointments = useCallback(
    async (afterId: number) => (await api<AgendamentoResponse[]>('GET', `${agendaBase}/novos?aposId=${afterId}`)).map(toAppointment),
    [agendaBase],
  )

  const listUsers = useCallback(async () => (await api<UsuarioResponse[]>('GET', '/api/admin/usuarios')).map(toAppUser), [])

  const createUser: AppStore['createUser'] = useCallback(async (u) => {
    await api('POST', '/api/admin/usuarios', {
      nome: u.name.trim(),
      email: u.email.trim(),
      perfil: u.role,
      barbeiroId: u.role === 'BARBEIRO' && u.barberId ? Number(u.barberId) : null,
      senhaProvisoria: u.tempPassword,
    })
  }, [])

  const updateUser: AppStore['updateUser'] = useCallback(async (id, u) => {
    await api('PUT', `/api/admin/usuarios/${id}`, {
      nome: u.name.trim(),
      email: u.email.trim(),
      perfil: u.role,
      barbeiroId: u.role === 'BARBEIRO' && u.barberId ? Number(u.barberId) : null,
    })
  }, [])

  const setUserActive = useCallback(async (id: string, active: boolean) => {
    await api('PATCH', `/api/admin/usuarios/${id}/${active ? 'ativar' : 'desativar'}`)
  }, [])

  const resetUserPassword = useCallback(async (id: string, tempPassword: string) => {
    await api('PATCH', `/api/admin/usuarios/${id}/redefinir-senha`, { senhaProvisoria: tempPassword })
  }, [])

  const saveService: AppStore['saveService'] = useCallback(
    async (service) => {
      const body = {
        nome: service.name,
        valor: service.price,
        duracaoMinutos: service.duration,
        descricao: emptyToNull(service.description),
        icone: service.icon,
        categoria: service.category,
      }
      const saved = service.id
        ? await api<ServicoResponse>('PUT', `/api/admin/servicos/${service.id}`, body)
        : await api<ServicoResponse>('POST', '/api/admin/servicos', body)
      if (saved.ativo !== service.active) {
        await api('PATCH', `/api/admin/servicos/${saved.id}/${service.active ? 'ativar' : 'desativar'}`)
      }
      await reload()
    },
    [reload],
  )

  const saveBarber: AppStore['saveBarber'] = useCallback(
    async (barber) => {
      const body = {
        nome: barber.name,
        especialidade: emptyToNull(barber.specialty),
        telefone: onlyDigits(barber.phone),
        fotoUrl: emptyToNull(barber.photo),
        telegramChatId: emptyToNull(barber.telegramChatId),
      }
      const saved = barber.id
        ? await api<BarbeiroResponse>('PUT', `/api/admin/barbeiros/${barber.id}`, body)
        : await api<BarbeiroResponse>('POST', '/api/admin/barbeiros', body)
      if ((saved.ativo ?? true) !== barber.active) {
        await api('PATCH', `/api/admin/barbeiros/${saved.id}/${barber.active ? 'ativar' : 'desativar'}`)
      }
      await reload()
    },
    [reload],
  )

  const toggleService = useCallback(
    async (id: string) => {
      const current = services.find((s) => s.id === id)
      if (!current) return
      // Otimista: muda na tela já e desfaz se a API recusar
      setServices((list) => list.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
      try {
        await api('PATCH', `/api/admin/servicos/${id}/${current.active ? 'desativar' : 'ativar'}`)
      } catch (err) {
        setServices((list) => list.map((s) => (s.id === id ? { ...s, active: current.active } : s)))
        throw err
      }
    },
    [services],
  )

  const toggleBarber = useCallback(
    async (id: string) => {
      const current = barbers.find((b) => b.id === id)
      if (!current) return
      setBarbers((list) => list.map((b) => (b.id === id ? { ...b, active: !b.active } : b)))
      try {
        await api('PATCH', `/api/admin/barbeiros/${id}/${current.active ? 'desativar' : 'ativar'}`)
      } catch (err) {
        setBarbers((list) => list.map((b) => (b.id === id ? { ...b, active: current.active } : b)))
        throw err
      }
    },
    [barbers],
  )

  // Barbeiro: /api/barbeiro/horarios (o backend usa o barbeiro do token, ignora o ID)
  const hoursBase = useCallback(
    (barberId: string) => (isAdmin ? `/api/admin/barbeiros/${barberId}/horarios` : '/api/barbeiro/horarios'),
    [isAdmin],
  )

  const listWorkingHours = useCallback(
    async (barberId: string) => (await api<HorarioTrabalhoResponse[]>('GET', hoursBase(barberId))).map(toWorkingHours),
    [hoursBase],
  )

  const saveWorkingHours = useCallback(async (barberId: string, h: WorkingHours) => {
    const withSeconds = (t: string | null) => (t ? `${t}:00` : null)
    const res = await api<HorarioTrabalhoResponse>('PUT', `${hoursBase(barberId)}/${h.day}`, {
      horaAbertura: withSeconds(h.open),
      horaFechamento: withSeconds(h.close),
      almocoInicio: withSeconds(h.lunchStart),
      almocoFim: withSeconds(h.lunchEnd),
    })
    return toWorkingHours(res)
  }, [hoursBase])

  const removeWorkingHours = useCallback(
    async (barberId: string, day: WeekDay) => {
      await api('DELETE', `${hoursBase(barberId)}/${day}`)
    },
    [hoursBase],
  )

  const value = useMemo<AppStore>(
    () => ({
      services,
      barbers,
      loading,
      loadError,
      reload,
      user,
      isAdmin,
      isBarber,
      login,
      logout,
      changePassword,
      getAvailableSlots,
      createAppointment,
      listAppointments,
      confirmAppointment,
      cancelAppointment,
      getLatestAppointmentId,
      listNewAppointments,
      saveService,
      saveBarber,
      toggleService,
      toggleBarber,
      listUsers,
      createUser,
      updateUser,
      setUserActive,
      resetUserPassword,
      listWorkingHours,
      saveWorkingHours,
      removeWorkingHours,
    }),
    [
      services, barbers, loading, loadError, reload, user, isAdmin, isBarber, login, logout, changePassword, getAvailableSlots, createAppointment,
      listAppointments, confirmAppointment, cancelAppointment, getLatestAppointmentId, listNewAppointments, saveService, saveBarber, toggleService, toggleBarber,
      listUsers, createUser, updateUser, setUserActive, resetUserPassword, listWorkingHours, saveWorkingHours, removeWorkingHours,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
