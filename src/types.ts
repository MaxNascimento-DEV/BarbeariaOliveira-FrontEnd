export type ServiceIcon = 'scissors' | 'beard' | 'combo' | 'razor' | 'spa' | 'color'

export type ServiceCategory = 'cabelo' | 'barba' | 'cuidados'

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // minutes
  icon: ServiceIcon
  category: ServiceCategory
  active: boolean
}

export interface Barber {
  id: string
  name: string
  /** Só vem preenchido nas rotas do admin (a API pública não expõe o telefone). */
  phone: string
  specialty: string
  photo?: string
  /** ID do chat do Telegram para receber avisos (só no admin). */
  telegramChatId?: string
  active: boolean
}

/** Espelha o enum StatusAgendamento do backend. */
export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_andamento' | 'finalizado' | 'cancelado'

export interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  serviceId: string
  serviceName: string
  barberId: string
  barberName: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  endTime: string // HH:mm
  price: number
  status: AppointmentStatus
  /** Link wa.me com a mensagem do cliente para a barbearia (tela de sucesso). */
  whatsappToBarbershop: string | null
  /** Link wa.me com a mensagem da barbearia para o cliente (painel admin). */
  whatsappToClient: string | null
}

/** Espelha o enum DiaSemana do backend. */
export type WeekDay = 'DOMINGO' | 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO'

export interface WorkingHours {
  day: WeekDay
  open: string // HH:mm
  close: string // HH:mm
  lunchStart: string | null
  lunchEnd: string | null
}

/** Espelha o enum Perfil do backend. */
export type Role = 'ADMIN' | 'BARBEIRO'

/** Quem está logado no painel (vem do login). */
export interface SessionUser {
  name: string
  email: string
  role: Role
  barberId: string | null
  mustChangePassword: boolean
}

/** Login gerenciado na tela Usuários. */
export interface AppUser {
  id: string
  name: string
  email: string
  role: Role
  barberId: string | null
  barberName: string | null
  active: boolean
  mustChangePassword: boolean
}
