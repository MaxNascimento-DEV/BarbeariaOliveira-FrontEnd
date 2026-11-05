import { useCallback, useEffect, useRef, useState } from 'react'
import type { Appointment } from '../types'
import { useAppStore } from '../store/AppStore'
import { useToast } from '../components/ui'
import { formatLongDate } from './format'

/** Evento disparado para a Agenda do dia recarregar quando chega agendamento novo. */
export const NEW_APPOINTMENTS_EVENT = 'oliveira:novos-agendamentos'

const POLL_MS = 15_000
const SOUND_KEY = 'oliveira:som-avisos'

type Permission = NotificationPermission | 'unsupported'

const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

/**
 * Consulta a API a cada 15 s e, quando entra agendamento novo:
 * toca um som, mostra notificação do navegador (se permitida), um toast,
 * pisca o título da aba e avisa a Agenda do dia para recarregar.
 */
export function useNewAppointmentAlerts() {
  const { isAdmin, isBarber, getLatestAppointmentId, listNewAppointments } = useAppStore()
  const active = isAdmin || isBarber
  const toast = useToast()
  const lastIdRef = useRef<number | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const [unread, setUnread] = useState(0)
  const [permission, setPermission] = useState<Permission>(() =>
    notificationsSupported() ? Notification.permission : 'unsupported',
  )
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== 'off'
    } catch {
      return true
    }
  })
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn

  // O navegador só libera áudio depois de um clique do usuário: cria o AudioContext no primeiro clique
  useEffect(() => {
    const unlock = () => {
      try {
        if (!audioRef.current) audioRef.current = new AudioContext()
        if (audioRef.current.state === 'suspended') void audioRef.current.resume()
      } catch {
        /* sem suporte a áudio */
      }
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  const playChime = useCallback(() => {
    const ctx = audioRef.current
    if (!ctx || ctx.state !== 'running' || !soundOnRef.current) return
    // "Plim-plom": duas notas curtas geradas na hora (sem arquivo de áudio)
    ;[880, 1320].forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.18
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.5)
    })
  }, [])

  const notify = useCallback(
    (list: Appointment[]) => {
      playChime()
      setUnread((n) => n + list.length)
      window.dispatchEvent(new CustomEvent(NEW_APPOINTMENTS_EVENT))

      for (const a of list.slice(0, 3)) {
        const when = `${formatLongDate(a.date)} às ${a.time}`
        toast.info(`Novo agendamento · ${a.clientName}`, `${a.serviceName} com ${a.barberName.split(' ')[0]} — ${when}`)
        if (notificationsSupported() && Notification.permission === 'granted') {
          try {
            const n = new Notification('💈 Novo agendamento', {
              body: `${a.clientName} — ${a.serviceName} com ${a.barberName}\n${when}`,
              tag: `agendamento-${a.id}`,
            })
            n.onclick = () => {
              window.focus()
              n.close()
            }
          } catch {
            /* alguns navegadores exigem service worker para notificar */
          }
        }
      }
      if (list.length > 3) toast.info(`+${list.length - 3} agendamentos novos`, 'Veja a Agenda do dia.')
    },
    [playChime, toast],
  )

  // Ref para o polling não reiniciar quando `notify` muda de identidade
  const notifyRef = useRef(notify)
  notifyRef.current = notify

  // Polling
  useEffect(() => {
    if (!active) return
    lastIdRef.current = null // trocou de perfil/login: recomeça a partir do último atual
    let stopped = false
    let timer: number | undefined

    const tick = async () => {
      try {
        if (lastIdRef.current === null) {
          lastIdRef.current = await getLatestAppointmentId()
        } else {
          const list = await listNewAppointments(lastIdRef.current)
          if (list.length) {
            lastIdRef.current = Math.max(lastIdRef.current, ...list.map((a) => Number(a.id)))
            if (!stopped) notifyRef.current(list)
          }
        }
      } catch {
        /* sem conexão: tenta de novo no próximo ciclo */
      }
      if (!stopped) timer = window.setTimeout(tick, POLL_MS)
    }
    tick()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [active, getLatestAppointmentId, listNewAppointments])

  // Título da aba: "(2) Novo agendamento" enquanto houver não vistos
  useEffect(() => {
    const original = document.title.replace(/^\(\d+\) /, '')
    document.title = unread ? `(${unread}) ${original}` : original
    return () => {
      document.title = original
    }
  }, [unread])

  const requestPermission = useCallback(async () => {
    if (!notificationsSupported()) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      toast.success('Avisos ativados', 'Você será notificado a cada novo agendamento.')
      playChime()
    } else if (result === 'denied') {
      toast.error('Notificações bloqueadas', 'Libere nas configurações do site (ícone de cadeado na barra de endereço).')
    }
  }, [playChime, toast])

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on
      try {
        localStorage.setItem(SOUND_KEY, next ? 'on' : 'off')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const clearUnread = useCallback(() => setUnread(0), [])

  return { unread, clearUnread, permission, requestPermission, soundOn, toggleSound, playChime }
}

export type AppointmentAlerts = ReturnType<typeof useNewAppointmentAlerts>
