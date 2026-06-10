import type { ReactNode } from 'react'
import './wml.css'
import { WmlNav } from '@/components/wml/WmlNav'

export const metadata = {
  title: 'WML 1.0 - Karma Score',
  description: 'Anonymous reputation social experiment',
}

export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wml-app">
      <WmlNav />
      <main className="wml-main">{children}</main>
    </div>
  )
}
