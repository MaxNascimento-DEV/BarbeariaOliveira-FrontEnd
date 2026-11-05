import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarCheck } from 'lucide-react'
import { Button, Modal, useToast } from '../ui'
import { ApiError, useAppStore, type Slot } from '../../store/AppStore'
import { isValidPhone } from '../../lib/masks'
import { Stepper } from './Stepper'
import { StepService } from './StepService'
import { StepBarber } from './StepBarber'
import { StepDateTime } from './StepDateTime'
import { StepIdentify } from './StepIdentify'
import { StepSuccess } from './StepSuccess'

const STEPS = ['Serviço', 'Barbeiro', 'Data e hora', 'Seus dados']
const TITLES = ['Escolha o serviço', 'Escolha seu barbeiro', 'Quando prefere vir?', 'Quase lá', 'Tudo certo']
const DESCRIPTIONS = [
  'Cada ritual inclui lavagem, toalha quente e finalização.',
  'Mestres da tesoura e da navalha, à sua escolha.',
  'Mostramos só os horários livres do barbeiro escolhido.',
  'Confirme seus dados para reservar a cadeira.',
  undefined,
]

interface Props {
  open: boolean
  onClose: () => void
  /** Optional service pre-selected from the landing page. */
  initialServiceId?: string | null
}

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

export function BookingWizard({ open, onClose, initialServiceId }: Props) {
  const { services, barbers, getAvailableSlots, createAppointment } = useAppStore()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [barberId, setBarberId] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  const activeServices = useMemo(() => services.filter((s) => s.active), [services])
  const activeBarbers = useMemo(() => barbers.filter((b) => b.active), [barbers])
  const service = services.find((s) => s.id === serviceId)
  const barber = barbers.find((b) => b.id === barberId)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null)
  const [slotsVersion, setSlotsVersion] = useState(0)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  // Busca os horários livres na API sempre que barbeiro, serviço ou data mudam
  useEffect(() => {
    if (!barberId || !serviceId || !date) {
      setSlots([])
      setSlotsMessage(null)
      return
    }
    let cancelled = false
    setSlotsLoading(true)
    setSlotsMessage(null)
    getAvailableSlots(barberId, serviceId, date)
      .then((list) => {
        if (!cancelled) setSlots(list)
      })
      .catch((err) => {
        if (cancelled) return
        setSlots([])
        // 409 = regra de negócio (ex.: barbeiro de folga); outros = falha de rede/servidor
        setSlotsMessage(err instanceof ApiError && err.status === 409 ? err.message : 'Não foi possível carregar os horários.')
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [barberId, serviceId, date, getAvailableSlots, slotsVersion])

  // Reset when (re)opened
  useEffect(() => {
    if (!open) return
    setStep(initialServiceId ? 1 : 0)
    setDir(1)
    setServiceId(initialServiceId ?? null)
    setBarberId(null)
    setDate(null)
    setTime(null)
    setErrors({})
    setSubmitting(false)
    setWhatsappUrl(null)
  }, [open, initialServiceId])

  const go = (to: number) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
  }

  const canContinue = [!!serviceId, !!barberId, !!date && !!time, true][step] ?? false

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    const next: typeof errors = {}
    if (name.trim().length < 2) next.name = 'Informe seu nome ou apelido.'
    if (!isValidPhone(phone)) next.phone = 'Informe um telefone válido com DDD.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      const created = await createAppointment({
        clientName: name.trim(),
        clientPhone: phone,
        serviceId: serviceId!,
        barberId: barberId!,
        date: date!,
        time: time!,
      })
      setWhatsappUrl(created.whatsappToBarbershop)
      toast.success('Horário reservado', 'Agora envie o agendamento para a barbearia pelo WhatsApp.')
      setDir(1)
      setStep(4)
    } catch (err) {
      const message = (err as Error).message
      if (err instanceof ApiError && err.status === 409 && !/agendamento ativo/i.test(message)) {
        // Regra de horário (ocupado, almoço, antecedência...): volta para data/hora com a grade atualizada
        toast.error('Horário indisponível', message)
        setTime(null)
        setSlotsVersion((v) => v + 1)
        setDir(-1)
        setStep(2)
      } else if (err instanceof ApiError && err.fields) {
        const fieldErrors: typeof errors = {}
        if (err.fields.nomeCliente) fieldErrors.name = err.fields.nomeCliente
        if (err.fields.telefoneCliente) fieldErrors.phone = err.fields.telefoneCliente
        setErrors(fieldErrors)
        toast.error('Confira seus dados', message)
      } else {
        toast.error('Não foi possível agendar', message)
      }
    } finally {
      setSubmitting(false)
    }
  }, [submitting, name, phone, serviceId, barberId, date, time, createAppointment, toast])

  const handleClose = useCallback(() => {
    if (submitting) return
    onClose()
  }, [submitting, onClose])

  const summary = { service, barber, date, time }

  const footer =
    step === 4 ? (
      <Button variant="brand" size="lg" fullWidth onClick={onClose}>
        Voltar ao Início
      </Button>
    ) : (
      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={() => go(step - 1)} disabled={submitting} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        )}
        {step < 3 ? (
          <Button
            variant="primary"
            size="lg"
            className="ml-auto flex-1 px-5 sm:flex-none sm:px-8"
            disabled={!canContinue}
            onClick={() => go(step + 1)}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Continuar
          </Button>
        ) : (
          <Button
            type="submit"
            form="identify-form"
            variant="brand"
            size="lg"
            className="ml-auto flex-1 px-5 sm:flex-none sm:px-8"
            loading={submitting}
            loadingText="Confirmando..."
            leftIcon={<CalendarCheck className="h-4 w-4" />}
          >
            Confirmar Agendamento
          </Button>
        )}
      </div>
    )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      variant="side"
      title={TITLES[step]}
      description={DESCRIPTIONS[step]}
      header={step < 4 ? <Stepper steps={STEPS} current={step} /> : undefined}
      footer={footer}
    >
      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={step}
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 && (
            <StepService
              services={activeServices}
              selectedId={serviceId}
              onSelect={(id) => {
                if (id !== serviceId) setTime(null)
                setServiceId(id)
                setTimeout(() => go(1), 220)
              }}
            />
          )}
          {step === 1 && (
            <StepBarber
              barbers={activeBarbers}
              selectedId={barberId}
              onSelect={(id) => {
                if (id !== barberId) setTime(null)
                setBarberId(id)
                setTimeout(() => go(2), 220)
              }}
            />
          )}
          {step === 2 && (
            <StepDateTime
              date={date}
              time={time}
              slots={slots}
              loading={slotsLoading}
              emptyMessage={slotsMessage}
              onDate={(d) => {
                setDate(d)
                setTime(null)
              }}
              onTime={setTime}
            />
          )}
          {step === 3 && (
            <StepIdentify
              name={name}
              phone={phone}
              onName={(v) => {
                setName(v)
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }))
              }}
              onPhone={(v) => {
                setPhone(v)
                if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }))
              }}
              errors={errors}
              summary={summary}
              onSubmit={handleSubmit}
            />
          )}
          {step === 4 && <StepSuccess clientName={name} summary={summary} whatsappUrl={whatsappUrl} />}
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}
