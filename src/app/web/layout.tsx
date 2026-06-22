import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/authcontext'
import AppShell from '@/components/wml/AppShell'
import '@/app/web/navbarwml.css'

export const metadata: Metadata = {
  title: 'WML 1.0 - Karma Score',
  description: 'Social experiment about public reputation and collective behavior.',
}

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
