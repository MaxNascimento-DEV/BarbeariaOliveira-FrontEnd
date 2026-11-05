import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, Menu, MessageCircle, X } from 'lucide-react'
import { Button, Logo } from '../ui'
import { CONTACT } from '../../data/mock'
import { cn } from '../../lib/cn'

export const NAV_LINKS = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#equipe', label: 'Equipe' },
  { href: '#estilos', label: 'Estilos' },
  { href: '#contato', label: 'Contato' },
]

export function Header({ onBook }: { onBook: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
        scrolled || open ? 'border-b border-white/10 bg-night/90 backdrop-blur-md' : 'bg-gradient-to-b from-night/80 to-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
        <a href="#inicio" aria-label="Barbearia Oliveira — voltar ao início" className="rounded-lg">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded text-sm font-semibold text-paper/80 transition-colors hover:text-brand"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="brand" size="sm" onClick={onBook} className="hidden sm:inline-flex" leftIcon={<CalendarCheck className="h-4 w-4" />}>
            Agendar
          </Button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full text-paper transition hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-mobile"
            aria-label="Menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="px-4 pb-2 pt-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[52px] items-center border-b border-white/10 font-display text-lg text-paper"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-3 px-4 pb-6 pt-4">
              <Button
                variant="brand"
                size="lg"
                className="px-4"
                leftIcon={<CalendarCheck className="h-5 w-5" />}
                onClick={() => {
                  setOpen(false)
                  onBook()
                }}
              >
                Agendar
              </Button>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-white/20 font-semibold text-paper transition hover:border-brand hover:text-brand"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
