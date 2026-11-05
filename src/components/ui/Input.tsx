import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/80">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/50">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${inputId}-msg` : undefined}
          className={cn(
            'h-12 w-full rounded-md border bg-white text-[15px] text-ink placeholder:text-ink/35 transition-all duration-200',
            'focus:outline-none focus:ring-4',
            icon ? 'pl-11 pr-4' : 'px-4',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
              : 'border-ink/15 hover:border-ink/30 focus:border-brand focus:ring-brand/20',
            className,
          )}
          {...rest}
        />
      </div>
      {(error || hint) && (
        <p id={`${inputId}-msg`} className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-ink/50')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
})
