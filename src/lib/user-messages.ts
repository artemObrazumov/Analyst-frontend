import type { ApiError } from 'src/api/errors'

const ERROR_CODE_MESSAGES: Record<string, string> = {
  BAD_REQUEST: 'Некорректный запрос',
  UNAUTHORIZED: 'Неверный email или пароль',
  FORBIDDEN: 'Доступ запрещён',
  NOT_FOUND: 'Ресурс не найден',
  CONFLICT: 'Этот email уже зарегистрирован',
  VALIDATION_ERROR: 'Проверьте введённые данные',
  INTERNAL_ERROR: 'Ошибка сервера. Попробуйте позже',
  ERROR: 'Произошла ошибка',
}

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Некорректный запрос',
  401: 'Требуется авторизация',
  403: 'Доступ запрещён',
  404: 'Не найдено',
  409: 'Конфликт данных',
  422: 'Ошибка валидации',
  500: 'Внутренняя ошибка сервера',
}

export function toUserMessage(error: ApiError): string {
  if (error.code === 'VALIDATION_ERROR' && error.message) {
    return error.message
  }
  return (
    ERROR_CODE_MESSAGES[error.code] ??
    error.message ??
    HTTP_STATUS_MESSAGES[error.status] ??
    'Произошла ошибка'
  )
}

export function defaultMessageForStatus(status: number): string {
  return HTTP_STATUS_MESSAGES[status] ?? 'Произошла ошибка'
}
