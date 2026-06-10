import './wml.css'
import { WmlNav } from '@/components/wml/WmlNav'

export const metadata = {
  title: 'WML 1.0 — Karma Score',
  description: 'Experimento social de reputación anónima',
}

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wml-app">
      <WmlNav />
      <main className="wml-main">{children}</main>
    </div>
  )
}
