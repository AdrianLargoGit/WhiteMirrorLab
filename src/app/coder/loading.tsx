import { headers } from 'next/headers'
import Navbar from '@/components/Navbar'
import styles from './coder.module.css'

export default async function LoadingCoder() {
  const lang = (await headers()).get('x-wml-locale') === 'en' ? 'en' : 'es'
  return <div className={styles.page}><Navbar lang={lang} /><main className={styles.main}><h1 className={styles.title}>Coder<span>.</span></h1><p className={styles.description} role="status">{lang === 'es' ? 'Cargando los repositorios desde GitHub…' : 'Loading repositories from GitHub…'}</p><div className={styles.loadingGrid} aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <div key={i} />)}</div></main></div>
}
