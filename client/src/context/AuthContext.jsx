import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '@services/api'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken)
        setToken(savedToken)
        setUser(decoded)
      } catch (e) {
        localStorage.removeItem('auth_token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username, password) => {
    const { data } = await authAPI.login(username, password)
    localStorage.setItem('auth_token', data.access)
    const decoded = jwtDecode(data.access)
    setToken(data.access)
    setUser(decoded)
    return data
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
