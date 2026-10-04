'use client'

import { createContext } from 'react'
import type { Locale } from './i18n'

export const LocaleContext = createContext<Locale>('es')
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}
