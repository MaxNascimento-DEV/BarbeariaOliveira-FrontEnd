import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../../lib/cn'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  type: ToastType
  title: string
  message?: string
}

interface ToastApi {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastCtx = createContext<ToastApi | null>(null)

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-brand" />,
  error: <AlertCircle className="h-5 w-5 text-red-400" />,
  info: <Info className="h-5 w-5 text-mint" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = ++seq.current
      setToasts((t) => [...t.slice(-3), { id, type, title, message }])
      setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, m) => push('success', t, m),
      error: (t, m) => push('error', t, m),
      info: (t, m) => push('info', t, m),
    }),
    [push],
  )

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 sm:left-auto sm:right-0 sm:items-end"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-night/95 p-4 text-paper shadow-lifted backdrop-blur',
                  t.type === 'error' ? 'border-red-400/30' : 'border-brand/30',
                )}
                role={t.type === 'error' ? 'alert' : 'status'}
              >
                <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.message && <p className="mt-0.5 text-sm text-paper/70">{t.message}</p>}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Fechar notificação"
                  className="-m-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-paper/60 hover:text-paper"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
