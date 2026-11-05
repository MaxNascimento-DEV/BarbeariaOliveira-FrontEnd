/**
 * Cliente HTTP da API Barbearia Oliveira (Spring Boot).
 * A URL vem de VITE_API_URL (arquivo .env); padrão http://localhost:8080.
 */

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8080'

const TOKEN_KEY = 'oliveira:token'
const EXPIRES_KEY = 'oliveira:token-expira'
const USER_KEY = 'oliveira:usuario'

/** Formato de erro do GlobalExceptionHandler (ErroResponse). */
export class ApiError extends Error {
  status: number
  fields?: Record<string, string>
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields ?? undefined
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY)
      const expires = sessionStorage.getItem(EXPIRES_KEY)
      if (!token) return null
      if (expires && new Date(expires).getTime() <= Date.now()) {
        this.clear()
        return null
      }
      return token
    } catch {
      return null
    }
  },
  set(token: string, expiresAt: string) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token)
      sessionStorage.setItem(EXPIRES_KEY, expiresAt)
    } catch {
      /* ignore */
    }
  },
  /** Dados de quem logou (nome, perfil...) — guardados junto com o token. */
  getUser<T>(): T | null {
    try {
      if (!this.get()) return null
      const raw = sessionStorage.getItem(USER_KEY)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  setUser(user: unknown) {
    try {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(EXPIRES_KEY)
      sessionStorage.removeItem(USER_KEY)
    } catch {
      /* ignore */
    }
  },
}

/** Chamado quando a API responde 401 numa rota logada (token expirado/inválido ou usuário desativado). */
let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function api<T = void>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  // Rotas que exigem login: admin, painel do barbeiro e a própria conta
  const isAdminRoute = /^\/api\/(admin|barbeiro|conta)\//.test(path)
  if (isAdminRoute) {
    const token = tokenStore.get()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.')
  }

  if (res.status === 401 && isAdminRoute) {
    tokenStore.clear()
    onUnauthorized?.()
    throw new ApiError(401, 'Sua sessão expirou. Entre novamente.')
  }

  if (!res.ok) {
    let message = defaultMessage(res.status)
    let fields: Record<string, string> | undefined
    try {
      const data = await res.json()
      if (data?.mensagem) message = data.mensagem
      if (data?.campos) {
        fields = data.campos
        const first = Object.values(data.campos)[0]
        if (typeof first === 'string') message = first
      }
    } catch {
      /* corpo vazio */
    }
    throw new ApiError(res.status, message, fields)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

function defaultMessage(status: number) {
  if (status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  if (status === 403) return 'Acesso negado.'
  if (status === 404) return 'Registro não encontrado.'
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.'
  return 'Não foi possível concluir a operação.'
}

/** "09:00:00" ou "09:00" → "09:00" */
export const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : '')
