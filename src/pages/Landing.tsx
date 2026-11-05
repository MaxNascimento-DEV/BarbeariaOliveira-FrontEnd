import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, MessageCircle } from 'lucide-react'
import { Header } from '../components/landing/Header'
import { Hero } from '../components/landing/Hero'
import { AboutSection, ContactFooter, GallerySection, ServicesSection, TeamSection } from '../components/landing/Sections'
import { BookingWizard } from '../components/booking/BookingWizard'
import { CONTACT } from '../data/mock'

export default function Landing() {
  const [booking, setBooking] = useState<{ open: boolean; serviceId: string | null }>({ open: false, serviceId: null })
  const openBooking = (serviceId?: string) => setBooking({ open: true, serviceId: serviceId ?? null })

  // Sticky mobile action bar appears once the hero CTA has scrolled away
  const [showBar, setShowBar] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-md bg-brand px-4 py-3 font-semibold text-night focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>

      <Header onBook={() => openBooking()} />

      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <Hero onBook={() => openBooking()} />
        <AboutSection onBook={() => openBooking()} />
        <ServicesSection onBook={openBooking} />
        <TeamSection />
        <GallerySection />
      </main>

      <ContactFooter
        onBook={() => openBooking()}
        adminLink={
          <Link to="/admin" className="rounded underline-offset-4 transition hover:text-brand hover:underline">
            Área restrita
          </Link>
        }
      />

      <AnimatePresence>
        {showBar && !booking.open && (
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night/95 px-4 pt-3 backdrop-blur-md sm:hidden"
          >
            <div className="flex gap-3">
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Conversar no WhatsApp"
                className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-white/20 text-paper transition hover:border-brand hover:text-brand"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
              <button
                type="button"
                onClick={() => openBooking()}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-md bg-brand font-semibold text-night shadow-brand-glow active:scale-[0.98]"
              >
                <CalendarCheck className="h-5 w-5" /> Agendar horário
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingWizard
        open={booking.open}
        initialServiceId={booking.serviceId}
        onClose={() => setBooking((b) => ({ ...b, open: false }))}
      />
    </>
  )
}
