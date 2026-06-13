import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '@services/api'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token)
    return exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken   = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')

    if (savedToken && !isTokenExpired(savedToken)) {
      const decoded = jwtDecode(savedToken)
      setToken(savedToken)
      setUser(decoded)
      setIsLoading(false)
    } else if (refreshToken && !isTokenExpired(refreshToken)) {
      // Access token expired but refresh token still valid — auto-refresh
      authAPI.refresh(refreshToken)
        .then(({ data }) => {
          localStorage.setItem('auth_token', data.access)
          const decoded = jwtDecode(data.access)
          setToken(data.access)
          setUser(decoded)
        })
        .catch(() => {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setIsLoading(false))
    } else {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      setIsLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const { data } = await authAPI.login(username, password)
    localStorage.setItem('auth_token', data.access)
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
    const decoded = jwtDecode(data.access)
    setToken(data.access)
    setUser(decoded)
    return decoded
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
    setUser(null)
  }

  const register = async (userData) => {
    const { data } = await authAPI.register(userData)
    return data
  }

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
