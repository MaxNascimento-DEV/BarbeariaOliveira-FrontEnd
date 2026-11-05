import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  /** Rendered above the body, under the title (e.g. a stepper). */
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** `center` = dialog; `side` = right side-panel on desktop, bottom sheet on mobile */
  variant?: 'center' | 'side'
  className?: string
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, description, header, children, footer, variant = 'center', className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  // Guarda o onClose mais recente sem reexecutar o efeito abaixo a cada render.
  // (Antes, cada tecla digitada recriava o onClose, o efeito rodava de novo e roubava o foco do campo.)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Hide the page behind the dialog from keyboard and screen readers.
    const appRoot = document.getElementById('root')
    appRoot?.setAttribute('inert', '')
    // Move focus into the dialog once it has mounted.
    const t = window.setTimeout(() => panelRef.current?.focus(), 30)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCloseRef.current()
      if (e.key !== 'Tab' || !panelRef.current) return
      // Keep keyboard focus inside the dialog.
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prevOverflow
      appRoot?.removeAttribute('inert')
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open])

  const isSide = variant === 'side'

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          // Keyed motion wrapper with its own exit so AnimatePresence always unmounts it after closing.
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1, pointerEvents: 'none', transition: { duration: 0.35 } }}
          className={cn(
            'fixed inset-0 z-50 flex',
            isSide ? 'items-end justify-end sm:items-stretch' : 'items-end justify-center sm:items-center sm:p-4',
          )}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-night/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-paper shadow-lifted focus:outline-none focus-visible:ring-0',
              isSide
                ? 'rounded-t-3xl sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-none sm:rounded-l-3xl'
                : 'rounded-t-3xl sm:max-w-lg sm:rounded-2xl',
              className,
            )}
            initial={isSide ? { y: '100%' } : { y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, x: 0, opacity: 1, scale: 1 }}
            exit={isSide ? { y: '100%' } : { y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* Grab handle — visual cue for the mobile bottom sheet */}
            <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink/15 sm:hidden" />
            <div className="border-b border-ink/10 px-5 pb-4 pt-3 sm:px-7 sm:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="font-display text-lg font-semibold text-night sm:text-2xl">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descId} className="mt-1 text-sm text-ink/65">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-mint hover:text-brand-dark focus-visible:ring-offset-paper"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {header && <div className="mt-4">{header}</div>}
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-5 sm:px-7">{children}</div>
            {footer && <div className="pb-safe border-t border-ink/10 bg-white/70 px-5 pt-4 sm:px-7 sm:pb-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
