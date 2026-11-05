import type { ServiceCategory } from '../types'

/**
 * Conteúdo fixo da vitrine (endereço, contato e horário exibido no site).
 * Serviços, barbeiros e agendamentos agora vêm da API.
 * Obs.: a grade de horários de agendamento vem de cada barbeiro (painel → Horários);
 * OPENING_HOURS aqui só alimenta o selo "Aberto agora" da landing.
 */

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; description: string }[] = [
  { value: 'cabelo', label: 'Cabelo', description: 'Cortes, acabamentos e finalização.' },
  { value: 'barba', label: 'Barba', description: 'Navalha, toalha quente e design.' },
  { value: 'cuidados', label: 'Cuidados', description: 'Tratamentos para cabelo e pele.' },
]

export const CONTACT = {
  street: 'Rua Iguatu, Nº 493',
  complement: 'Loja 1 · Recife – PE',
  city: 'Recife – PE',
  address: 'Rua Iguatu, 493, Recife - PE',
  phone: '(81) 9 8492-0075',
  whatsappUrl: 'https://wa.me/5581984920075',
}

/** Horário de funcionamento por dia da semana (0 = domingo). `null` = fechado. */
export const OPENING_HOURS: Record<number, { start: number; end: number } | null> = {
  0: { start: 9, end: 12 },
  1: { start: 9, end: 18 },
  2: { start: 9, end: 18 },
  3: { start: 9, end: 18 },
  4: { start: 9, end: 18 },
  5: { start: 9, end: 18 },
  6: { start: 9, end: 18 },
}

/** Labels shown on the landing page. */
export const OPENING_HOURS_LABELS: Array<[string, string]> = [
  ['Segunda a sábado', '09h — 18h'],
  ['Domingo', '09h — 12h'],
]
