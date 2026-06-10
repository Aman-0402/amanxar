import { createContext, useContext } from 'react'

const ThemeContext = createContext({ theme: 'light', isDark: false, toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
