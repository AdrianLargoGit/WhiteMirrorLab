import type { Metadata } from 'next'
import { headers } from 'next/headers'
import SafeFileApp from './SafeFileApp'

export async function generateMetadata(): Promise<Metadata> {
  const english = (await headers()).get('x-wml-locale') === 'en'
  return {
    title: 'SafeFile | White Mirror Lab',
    description: english
      ? 'Portable password encryption and permanent black redactions. Files are processed locally in your browser.'
      : 'Cifrado portátil con contraseña y censura irreversible con rectángulos negros. Procesamiento local en tu navegador.',
  }
}

export default async function SafeFilePage() {
  const lang = (await headers()).get('x-wml-locale') === 'en' ? 'en' : 'es'
  return <SafeFileApp lang={lang} />
}
