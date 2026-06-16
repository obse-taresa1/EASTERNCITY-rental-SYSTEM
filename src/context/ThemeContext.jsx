/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const value = {
    theme: 'light',
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
