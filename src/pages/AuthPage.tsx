import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from 'src/stores/auth.store'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  function handleSubmit() {
    login()
    navigate({ to: '/projects' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold">
            {mode === 'login' ? 'Войти' : 'Регистрация'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-primary underline underline-offset-4"
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary underline underline-offset-4"
                >
                  Войти
                </button>
              </>
            )}
          </p>
        </div>

        <div className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Имя"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </div>
    </div>
  )
}
