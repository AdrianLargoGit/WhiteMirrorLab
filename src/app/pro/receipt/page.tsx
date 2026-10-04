import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ProReceipt from './ProReceipt'

export const metadata: Metadata = { title: 'WML Pro', robots: { index: false, follow: false } }

export default async function ProReceiptPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = (await searchParams).lang === 'en' ? 'en' : 'es'
  return <div className="landing-page"><Navbar lang={lang} /><ProReceipt lang={lang} /></div>
}
