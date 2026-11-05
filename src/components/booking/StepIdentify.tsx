import { Phone, ShieldCheck, User } from 'lucide-react'
import { Input } from '../ui'
import { maskPhone } from '../../lib/masks'
import { BookingSummary } from './BookingSummary'
import type { Barber, Service } from '../../types'

interface Props {
  name: string
  phone: string
  onName: (v: string) => void
  onPhone: (v: string) => void
  errors: { name?: string; phone?: string }
  summary: { service?: Service; barber?: Barber; date: string | null; time: string | null }
  onSubmit: () => void
}

export function StepIdentify({ name, phone, onName, onPhone, errors, summary, onSubmit }: Props) {
  return (
    <form
      id="identify-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-6"
    >
      <BookingSummary {...summary} />
      <div className="space-y-4">
        <Input
          label="Nome ou apelido"
          placeholder="Como devemos chamá-lo?"
          autoComplete="given-name"
          maxLength={60}
          value={name}
          onChange={(e) => onName(e.target.value)}
          error={errors.name}
          icon={<User className="h-4 w-4" />}
        />
        <Input
          label="Telefone / WhatsApp"
          placeholder="(81) 98765-4321"
          inputMode="tel"
          autoComplete="tel-national"
          value={phone}
          onChange={(e) => onPhone(maskPhone(e.target.value))}
          error={errors.phone}
          icon={<Phone className="h-4 w-4" />}
        />
      </div>
      <p className="flex items-start gap-2 text-xs text-ink/50">
        <ShieldCheck className="h-4 w-4 shrink-0 text-brand-dark/60" />
        Seu telefone fica só com a barbearia, para falar com você sobre este horário.
      </p>
    </form>
  )
}
