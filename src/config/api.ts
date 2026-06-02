const configured = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export const API_BASE_URL =
  configured || (import.meta.env.DEV ? 'http://localhost:8080' : '')

export const API_PREFIX = '/api'
