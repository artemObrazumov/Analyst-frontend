import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ApiError } from 'src/api/client'
import { toUserMessage } from 'src/lib/user-messages'
import AuthLayout from 'src/components/layouts/AuthLayout'
import { useAuthStore } from 'src/stores/auth.store'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      navigate({ to: '/projects' })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(toUserMessage(err))
      } else {
        setError('Не удалось выполнить запрос. Проверьте подключение к серверу.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClassName =
    'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            {mode === 'login' ? 'Войти' : 'Регистрация'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError(null)
                  }}
                  className="text-primary underline underline-offset-4"
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                  }}
                  className="text-primary underline underline-offset-4"
                >
                  Войти
                </button>
              </>
            )}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            disabled={loading}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? 'Загрузка…'
            : mode === 'login'
              ? 'Войти'
              : 'Создать аккаунт'}
        </button>
      </div>
    </AuthLayout>
  )
}
