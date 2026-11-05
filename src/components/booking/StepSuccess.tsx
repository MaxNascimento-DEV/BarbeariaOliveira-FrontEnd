import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { BookingSummary } from './BookingSummary'
import type { Barber, Service } from '../../types'

interface Props {
  clientName: string
  summary: { service?: Service; barber?: Barber; date: string | null; time: string | null }
  /** Link wa.me gerado pelo backend com a mensagem do agendamento. */
  whatsappUrl?: string | null
}

function AnimatedCheck() {
  return (
    <div className="relative mx-auto h-24 w-24">
      <motion.span
        className="absolute inset-0 rounded-full bg-brand/25"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.35, 1.2], opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
      />
      <svg viewBox="0 0 96 96" className="relative h-24 w-24">
        <motion.circle
          cx="48"
          cy="48"
          r="44"
          fill="#0F0F0F"
          stroke="#5DD62C"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ originX: '50%', originY: '50%' }}
        />
        <motion.path
          d="M30 49 L43 62 L67 36"
          fill="none"
          stroke="#5DD62C"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}

export function StepSuccess({ clientName, summary, whatsappUrl }: Props) {
  const firstName = clientName.trim().split(' ')[0]
  return (
    <div className="py-4 text-center">
      <AnimatedCheck />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark">Horário reservado</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-night sm:text-3xl">Até breve, {firstName}.</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
          {whatsappUrl
            ? 'Para garantir sua cadeira, envie o agendamento para a barbearia pelo WhatsApp. A confirmação é feita por lá — sem confirmação em até 20 minutos, o horário é liberado.'
            : 'Sua cadeira está reservada. A barbearia vai confirmar o seu horário em breve.'}
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 text-sm font-bold text-night shadow-soft transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-5 w-5" /> Enviar para a barbearia no WhatsApp
          </a>
        )}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-7 text-left">
        <BookingSummary {...summary} tone="dark" />
      </motion.div>
    </div>
  )
}
