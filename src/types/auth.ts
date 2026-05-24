export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export interface UserResponse {
  id: string
  email: string
  name: string
  role: string
}

export interface ApiErrorBody {
  error: string
  message: string
}

export interface LogoutResponse {
  message: string
}
