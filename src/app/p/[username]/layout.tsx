import { AuthProvider } from '@/lib/authcontext'
import AppShell from '@/components/wml/AppShell'
import '@/app/web/navbarwml.css'

export default function PublicProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell requireAuth={false}>{children}</AppShell>
    </AuthProvider>
  )
}
