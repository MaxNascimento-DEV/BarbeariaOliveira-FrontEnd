import { CalendarCheck, ChevronRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useAppStore } from '../../store/AppStore'
import { Avatar, Button, LogoMark, ServiceIcon } from '../ui'
import { formatBRL, formatDuration } from '../../lib/format'
import { CONTACT, OPENING_HOURS, OPENING_HOURS_LABELS, SERVICE_CATEGORIES } from '../../data/mock'
import { ABOUT_IMAGES, GALLERY_IMAGES, unsplash } from '../../data/media'
import type { ServiceIcon as IconName } from '../../types'
import { cn } from '../../lib/cn'
import { Eyebrow, Reveal, isOpenNow } from './Reveal'

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`
const telUrl = `tel:+55${CONTACT.phone.replace(/\D/g, '')}`

/* ------------------------------------------------------------------ */
/* Sobre                                                               */
/* ------------------------------------------------------------------ */
export function AboutSection({ onBook }: { onBook: () => void }) {
  const open = isOpenNow(OPENING_HOURS)
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Mosaic */}
        <Reveal className="order-2 lg:order-1">
          <div className="grid grid-cols-5 grid-rows-2 gap-3 sm:gap-4">
            <figure className="col-span-3 row-span-2 overflow-hidden rounded-3xl bg-surface">
              <img
                src={unsplash(ABOUT_IMAGES[0].id, 900, 1200)}
                alt={ABOUT_IMAGES[0].alt}
                loading="lazy"
                className="aspect-[3/4] h-full w-full object-cover"
              />
            </figure>
            {ABOUT_IMAGES.slice(1).map((img) => (
              <figure key={img.id} className="col-span-2 overflow-hidden rounded-3xl bg-surface">
                <img src={unsplash(img.id, 600, 600)} alt={img.alt} loading="lazy" className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <Reveal>
            <Eyebrow>Sobre nós</Eyebrow>
            <h2 id="sobre-title" className="mt-4 text-balance font-display text-[1.75rem] font-semibold leading-tight text-night sm:text-4xl">
              O caminho para a sua <span className="text-brand-dark">melhor versão.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {OPENING_HOURS_LABELS.map(([day, hours]) => (
                <div key={day} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark">{day}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-night">{hours}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/75">
              <span aria-hidden className={cn('h-2 w-2 rounded-full', open ? 'bg-brand-dark' : 'bg-ink/30')} />
              {open ? 'Aberto agora' : 'Fechado agora'}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/75">
              <p>
                Na <strong className="text-night">Barbearia Oliveira</strong>, acreditamos que cuidar da aparência é também cuidar da
                autoestima. Somos um espaço acolhedor, pensado para você relaxar enquanto um profissional cuida de cada detalhe.
              </p>
              <p>
                Do corte clássico ao degradê, da barba na navalha aos tratamentos: cada atendimento é feito com atenção, sem pressa e
                com hora marcada, para você não perder tempo esperando.
              </p>
              <p className="font-semibold text-night">Barbearia Oliveira: cuidado, estilo e autoestima.</p>
            </div>
            <Button variant="primary" size="lg" className="mt-8 w-full sm:w-auto" onClick={onBook} leftIcon={<CalendarCheck className="h-5 w-5" />}>
              Agendar horário
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Serviços                                                            */
/* ------------------------------------------------------------------ */
const CATEGORY_ICON: Record<string, IconName> = { cabelo: 'scissors', barba: 'beard', cuidados: 'spa' }

export function ServicesSection({ onBook }: { onBook: (serviceId?: string) => void }) {
  const services = useAppStore().services.filter((s) => s.active)
  const groups = SERVICE_CATEGORIES.map((c) => ({ ...c, items: services.filter((s) => (s.category ?? 'cabelo') === c.value) })).filter(
    (g) => g.items.length,
  )

  return (
    <section id="servicos" aria-labelledby="servicos-title" className="relative overflow-hidden bg-night py-20 text-paper sm:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand/15 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand-dark/25 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="light">O que fazemos</Eyebrow>
          <h2 id="servicos-title" className="mt-4 font-display text-[1.75rem] font-semibold leading-tight sm:text-4xl">
            Nossos <span className="text-brand">serviços</span>
          </h2>
          <p className="mt-4 text-paper/75">Toque em um serviço para agendar direto. Os valores já estão no cardápio, sem surpresas.</p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.value} delay={i * 0.08}>
              <article
                aria-labelledby={`cat-${g.value}`}
                className="h-full rounded-3xl border border-white/10 bg-surface/80 p-5 transition-colors duration-300 hover:border-brand/50 sm:p-6"
              >
                <header className="flex items-center gap-3.5 border-b border-white/10 pb-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-night">
                    <ServiceIcon name={CATEGORY_ICON[g.value]} className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div>
                    <h3 id={`cat-${g.value}`} className="font-display text-lg font-semibold">
                      {g.label}
                    </h3>
                    <p className="text-sm text-paper/65">{g.description}</p>
                  </div>
                </header>
                <ul className="mt-2">
                  {g.items.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onBook(s.id)}
                        aria-label={`Agendar ${s.name}, ${formatBRL(s.price)}, ${formatDuration(s.duration)}`}
                        className="group flex min-h-[64px] w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-white/5 focus-visible:ring-offset-surface"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold leading-snug">{s.name}</span>
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-paper/60">
                            <Clock className="h-3.5 w-3.5" aria-hidden /> {formatDuration(s.duration)}
                          </span>
                        </span>
                        <span className="whitespace-nowrap text-base font-extrabold tabular-nums text-brand">{formatBRL(s.price)}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-paper/40 transition group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button variant="brand" size="lg" onClick={() => onBook()} leftIcon={<CalendarCheck className="h-5 w-5" />} className="w-full sm:w-auto">
            Agendar horário
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Equipe                                                              */
/* ------------------------------------------------------------------ */
export function TeamSection() {
  const barbers = useAppStore().barbers.filter((b) => b.active)
  if (!barbers.length) return null
  return (
    <section id="equipe" aria-labelledby="equipe-title" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <Eyebrow>Nossa equipe</Eyebrow>
          <h2 id="equipe-title" className="mt-4 font-display text-[1.75rem] font-semibold leading-tight text-night sm:text-4xl">
            Quem cuida de <span className="text-brand-dark">você</span>
          </h2>
        </Reveal>
        <ul className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {barbers.map((b, i) => (
            <li key={b.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Reveal delay={i * 0.08}>
                <div className="flex items-center gap-4 rounded-3xl border border-ink/10 bg-white p-4 shadow-soft">
                  <Avatar name={b.name} src={b.photo} className="h-20 w-20 text-2xl" />
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-night">{b.name}</p>
                    <p className="mt-1 text-sm text-ink/65">{b.specialty}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Inspirações de estilo                                               */
/* ------------------------------------------------------------------ */
export function GallerySection() {
  return (
    <section id="estilos" aria-labelledby="estilos-title" className="bg-white pt-20 sm:pt-28">
      <Reveal className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <Eyebrow className="justify-center">Galeria</Eyebrow>
        <h2 id="estilos-title" className="mt-4 font-display text-[1.75rem] font-semibold leading-tight text-night sm:text-4xl">
          Inspirações de <span className="text-brand-dark">estilo</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink/70">Traga a sua referência ou escolha uma das nossas. A gente ajuda a encontrar o corte ideal.</p>
      </Reveal>
      <ul
        aria-label="Fotos de cortes e barbas"
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 md:grid md:grid-cols-6 md:gap-0 md:overflow-visible md:px-0"
      >
        {GALLERY_IMAGES.map((img) => (
          <li key={img.id} className="w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl bg-surface md:w-auto md:rounded-none">
            <img
              src={unsplash(img.id, 600, 750)}
              alt={img.alt}
              loading="lazy"
              className="aspect-[4/5] h-full w-full object-cover transition duration-700 hover:scale-105 md:aspect-square"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Contato + rodapé                                                    */
/* ------------------------------------------------------------------ */
export function ContactFooter({ onBook, adminLink }: { onBook: () => void; adminLink: React.ReactNode }) {
  const actions = [
    { href: CONTACT.whatsappUrl, label: 'WhatsApp', icon: MessageCircle, external: true },
    { href: mapsUrl, label: 'Como chegar', icon: MapPin, external: true },
    { href: telUrl, label: 'Ligar', icon: Phone, external: false },
  ]
  return (
    <footer id="contato" aria-labelledby="contato-title" className="bg-night pb-28 pt-16 text-paper sm:pb-12 sm:pt-20">
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <LogoMark alt="" className="mx-auto h-20" />
        <h2 id="contato-title" className="mt-5 font-display text-2xl font-semibold">
          Barbearia <span className="text-brand">Oliveira</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-paper/70">
          Da barba ao cabelo, cada detalhe é pensado para valorizar o que há de único em você.
        </p>

        <ul className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          {actions.map(({ href, label, icon: Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-surface text-sm font-semibold transition hover:border-brand hover:text-brand"
              >
                <Icon className="h-5 w-5 text-brand" aria-hidden />
                {label}
              </a>
            </li>
          ))}
        </ul>

        <address className="mt-10 grid gap-6 border-t border-white/10 pt-8 text-sm not-italic text-paper/75 sm:grid-cols-2 sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Endereço</p>
            <p className="mt-2">
              {CONTACT.street}
              <br />
              {CONTACT.complement}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Horário</p>
            <dl className="mt-2 space-y-1">
              {OPENING_HOURS_LABELS.map(([d, h]) => (
                <div key={d} className="flex justify-center gap-2 sm:justify-end">
                  <dt>{d}:</dt>
                  <dd className="font-semibold text-paper">{h}</dd>
                </div>
              ))}
            </dl>
          </div>
        </address>

        <Button variant="brand" size="lg" className="mt-10 hidden sm:inline-flex" onClick={onBook} leftIcon={<CalendarCheck className="h-5 w-5" />}>
          Agendar horário
        </Button>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-paper/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Barbearia Oliveira. Todos os direitos reservados.</p>
          {adminLink}
        </div>
      </div>
    </footer>
  )
}
