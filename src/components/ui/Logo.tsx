import { cn } from '../../lib/cn'

/** Official Oliveira logo (public/logo.png — transparent background, 953x857). */
export function LogoMark({ className, alt = '' }: { className?: string; alt?: string }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={953}
      height={857}
      draggable={false}
      className={cn('aspect-[953/857] h-10 w-auto shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]', className)}
    />
  )
}

export function Logo({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="h-11" />
      <div className="leading-none">
        <span className={cn('block font-display text-base font-semibold tracking-wide', tone === 'light' ? 'text-paper' : 'text-night')}>
          Oliveira
        </span>
        <span className={cn('mt-1 block text-[10px] font-bold uppercase tracking-[0.3em]', tone === 'light' ? 'text-brand' : 'text-brand-dark')}>
          Barbearia
        </span>
      </div>
    </div>
  )
}
