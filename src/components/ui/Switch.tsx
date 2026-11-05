import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  /** Screen-reader name when there is no visible label (e.g. "Ativar Corte Clássico"). */
  ariaLabel?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function Switch({ checked, onChange, label, ariaLabel, disabled, size = 'md' }: SwitchProps) {
  const dims = size === 'sm' ? { track: 'h-5 w-9', knob: 'h-4 w-4', x: 16 } : { track: 'h-6 w-11', knob: 'h-5 w-5', x: 20 }
  return (
    <span className={cn('inline-flex items-center gap-3', disabled && 'opacity-50')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label ?? (checked ? 'Ativo' : 'Inativo')}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-300',
          // Invisible padding so the touch target is ~44px even though the track is small.
          "before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']",
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          checked ? 'bg-surface' : 'bg-ink/15',
          dims.track,
        )}
      >
        <motion.span
          initial={false}
          animate={{ x: checked ? dims.x : 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className={cn('rounded-full shadow-sm', checked ? 'bg-brand' : 'bg-white', dims.knob)}
        />
      </button>
      {label && <span className="text-sm font-medium text-ink/80">{label}</span>}
    </span>
  )
}
