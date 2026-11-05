import type { ComponentType } from 'react'
import { Brush, Crown, Droplets, Palette, Scissors, Sparkles, type LucideProps } from 'lucide-react'
import type { ServiceIcon as IconName } from '../../types'

const MAP: Record<IconName, ComponentType<LucideProps>> = {
  scissors: Scissors,
  beard: Brush,
  combo: Crown,
  razor: Sparkles,
  spa: Droplets,
  color: Palette,
}

export const SERVICE_ICON_OPTIONS: { value: IconName; label: string }[] = [
  { value: 'scissors', label: 'Tesoura' },
  { value: 'beard', label: 'Barba' },
  { value: 'combo', label: 'Combo' },
  { value: 'razor', label: 'Navalha' },
  { value: 'spa', label: 'Tratamento' },
  { value: 'color', label: 'Coloração' },
]

export function ServiceIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = MAP[name] ?? Scissors
  return <Icon {...props} />
}
