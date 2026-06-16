/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const value = {
    language: 'en',
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
