import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'brand' | 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  brand:
    'bg-brand text-night shadow-[0_6px_20px_-6px_rgba(93,214,44,0.6)] hover:shadow-brand-glow hover:brightness-[1.06] focus-visible:ring-brand',
  primary: 'bg-surface text-paper hover:bg-night shadow-soft focus-visible:ring-brand-dark',
  outline: 'border border-brand/60 text-brand hover:bg-brand/10 hover:border-brand focus-visible:ring-brand',
  ghost: 'text-brand-dark hover:bg-mint focus-visible:ring-brand-dark',
  danger: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-14 px-8 text-base gap-2.5 tracking-wide',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, loadingText, leftIcon, rightIcon, fullWidth, className, children, disabled, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      // Guard against double submits even before `disabled` re-renders.
      onClick={(e) => {
        if (loading) return e.preventDefault()
        onClick?.(e)
      }}
      className={cn(
        'group relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-md font-semibold',
        'transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {variant === 'brand' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-white/40 blur-md group-hover:animate-shimmer"
        />
      )}
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      <span className="relative">{loading && loadingText ? loadingText : children}</span>
      {!loading && rightIcon}
    </button>
  )
})
