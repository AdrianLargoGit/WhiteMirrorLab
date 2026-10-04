import type { Metadata } from 'next'
import { headers } from 'next/headers'
import CoderLibrary from './CoderLibrary'
import { loadCoderRepositories } from '@/lib/coder-loader'

export async function generateMetadata(): Promise<Metadata> {
  const english = (await headers()).get('x-wml-locale') === 'en'
  return {
    title: 'Coder | White Mirror Lab',
    description: english
      ? 'A curated library of useful public GitHub repositories. Find tools for development, AI, automation and learning.'
      : 'Una biblioteca de repositorios públicos de GitHub muy útiles. Encuentra herramientas de desarrollo, IA, automatización y aprendizaje.',
  }
}

export default async function CoderPage() {
  const lang = (await headers()).get('x-wml-locale') === 'en' ? 'en' : 'es'
  const repositories = await loadCoderRepositories()
  return <CoderLibrary lang={lang} catalog={repositories} />
}
