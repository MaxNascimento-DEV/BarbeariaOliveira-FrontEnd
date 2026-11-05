import { motion } from 'framer-motion'
import { CalendarCheck, Clock, MapPin, MessageCircle } from 'lucide-react'
import { Button, LogoMark } from '../ui'
import { CONTACT, OPENING_HOURS, OPENING_HOURS_LABELS } from '../../data/mock'
import { HERO_IMAGE, unsplash } from '../../data/media'
import { isOpenNow } from './Reveal'
import { cn } from '../../lib/cn'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

export function Hero({ onBook }: { onBook: () => void }) {
  const open = isOpenNow(OPENING_HOURS)

  const info = [
    {
      icon: MapPin,
      label: 'Endereço',
      value: `${CONTACT.street} · ${CONTACT.complement}`,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`,
      hint: 'Abrir no Google Maps',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: CONTACT.phone,
      href: CONTACT.whatsappUrl,
      hint: 'Conversar no WhatsApp',
    },
    {
      icon: Clock,
      label: 'Horário',
      value: OPENING_HOURS_LABELS.map(([d, h]) => `${d.replace('Segunda a sábado', 'Seg–Sáb').replace('Domingo', 'Dom')} ${h}`).join(' · '),
    },
  ]

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-paper">
      <motion.img
        src={unsplash(HERO_IMAGE, 1800)}
        srcSet={`${unsplash(HERO_IMAGE, 800)} 800w, ${unsplash(HERO_IMAGE, 1400)} 1400w, ${unsplash(HERO_IMAGE, 2000)} 2000w`}
        sizes="100vw"
        alt=""
        aria-hidden
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease: 'easeOut' }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,15,15,0.75)_0%,rgba(15,15,15,0.55)_40%,rgba(15,15,15,0.92)_80%,#0F0F0F_100%)]" />
      <div aria-hidden className="absolute -left-24 top-1/3 -z-10 h-72 w-72 rounded-full bg-brand/20 blur-[100px]" />

      {/* Main message */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-10 pt-28 text-center sm:pt-32">
        <motion.div {...fade(0.05)}>
          <LogoMark alt="Logo da Barbearia Oliveira" className="h-24 sm:h-32" />
        </motion.div>

        <motion.p
          {...fade(0.15)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-paper/90 backdrop-blur"
        >
          <span className={cn('h-2 w-2 rounded-full', open ? 'bg-brand' : 'bg-paper/40')} aria-hidden />
          <span>Barbearia Oliveira · Recife – PE</span>
          <span className="sr-only">{open ? '— aberta agora' : '— fechada agora'}</span>
        </motion.p>

        <motion.h1
          id="hero-title"
          {...fade(0.25)}
          className="mt-6 text-balance font-display text-[2rem] font-semibold leading-[1.12] sm:text-5xl lg:text-6xl"
        >
          Estilo não se improvisa.
          <span className="mt-1 block text-brand">Invista em você.</span>
        </motion.h1>

        <motion.p {...fade(0.4)} className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-paper/80 sm:text-lg">
          Na Barbearia Oliveira, cada detalhe importa. Oferecemos mais do que um corte, oferecemos cuidado, estilo e autoestima.
        </motion.p>

        <motion.div {...fade(0.55)} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button variant="brand" size="lg" onClick={onBook} leftIcon={<CalendarCheck className="h-5 w-5" />} className="w-full sm:w-auto sm:px-10">
            Agendar horário
          </Button>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-white/25 px-8 font-semibold text-paper transition hover:border-brand hover:text-brand"
          >
            <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
          </a>
        </motion.div>
      </div>

      {/* Info bar */}
      <motion.div {...fade(0.7)} className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-8 sm:pb-10">
        <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-night/60 backdrop-blur-md md:grid md:grid-cols-3 md:divide-x md:divide-y-0 md:rounded-none md:border-x-0 md:border-b-0 md:bg-transparent md:backdrop-blur-none">
          {info.map(({ icon: Icon, label, value, href, hint }) => {
            const content = (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 text-brand md:hidden">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 md:text-center">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-brand">{label}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-paper">{value}</span>
                </span>
              </>
            )
            const cls = 'flex min-h-[64px] items-center gap-3 px-4 py-3 md:justify-center md:px-6 md:pt-6'
            return (
              <li key={label}>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" aria-label={`${label}: ${value}. ${hint}`} className={cn(cls, 'transition hover:bg-white/5')}>
                    {content}
                  </a>
                ) : (
                  <div className={cls}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      </motion.div>
    </section>
  )
}
