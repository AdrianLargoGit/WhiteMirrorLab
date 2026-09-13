import Navbar from '@/components/Navbar'
import styles from './page.module.css'

const kpis = [
  { label: 'Visitantes del experimento', value: '829', note: 'WML 1.0' },
  { label: 'Consentimientos', value: '293', note: '35,34% de visitantes' },
  { label: 'Perfiles creados', value: '309', note: 'identidad social' },
  { label: 'Votos guardados', value: '343', note: 'sobre perfiles' },
]

const funnel = [
  { label: 'Visitantes WML 1.0', value: 829 },
  { label: 'Consentimientos', value: 293 },
  { label: 'Registros', value: 139 },
  { label: 'Perfiles votados', value: 67 },
]

const voteSplit = [
  { label: 'Positivos', value: 244, percent: 71.14 },
  { label: 'Negativos', value: 99, percent: 28.86 },
]

const profileSignal = [
  { label: 'Perfiles creados', value: 309 },
  { label: 'Perfiles votados', value: 67 },
  { label: 'Solo positivos', value: 39 },
  { label: 'Mas negativos que positivos', value: 7 },
]

const contentSignal = [
  { label: 'Con posts o pulses', votes: 303, positive: '68,32%' },
  { label: 'Sin contenido', votes: 40, positive: '92,50%' },
  { label: 'Con posts y pulses', votes: 117, positive: '82,05%' },
  { label: '3+ contenidos', votes: 159, positive: '81,13%' },
]

const readout = [
  'La mecanica principal fue evaluacion social de perfiles.',
  'Los votos guardados fueron 244 positivos y 99 negativos.',
  'Los perfiles con posts o pulses concentraron 303 votos.',
  'La lectura publica evita exponer perfiles, contenido concreto o patrones vendibles.',
]

export default function WmlOneResultsPage() {
  const maxFunnel = Math.max(...funnel.map((item) => item.value))
  const maxProfileSignal = Math.max(...profileSignal.map((item) => item.value))
  const maxContentVotes = Math.max(...contentSignal.map((item) => item.votes))

  return (
    <>
      <Navbar lang="es" />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>WML 1.0 / resultados agregados</p>
            <h1>WML 1.0 en datos.</h1>
            <p>
              Datos del experimento social: consentimiento, perfiles, contenido
              publicado y evaluacion agregada. Sin perfiles concretos,
              identificadores, busquedas ni contenido subido.
            </p>
            <p className={styles.publicScope}>
              Esta vista recoge un extracto publicable del archivo estadistico;
              el analisis completo permanece limitado a datos agregados,
              anonimizados y comercialmente sensibles.
            </p>
          </div>

          <div className={styles.heroChart} aria-label="Resumen de voto positivo">
            <div className={styles.donut}>
              <span>71,14%</span>
            </div>
            <div className={styles.legend}>
              <span><i className={styles.positive} />244 positivos</span>
              <span><i className={styles.negative} />99 negativos</span>
              <span><i className={styles.neutral} />343 votos guardados</span>
            </div>
          </div>
        </section>

        <section className={styles.kpiGrid} aria-label="Metricas principales">
          {kpis.map((kpi) => (
            <article key={kpi.label}>
              <strong>{kpi.value}</strong>
              <span>{kpi.label}</span>
              <em>{kpi.note}</em>
            </article>
          ))}
        </section>

        <section className={styles.dashboard}>
          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <span>Funnel</span>
              <strong>Entrada al experimento</strong>
            </div>
            <div className={styles.funnel}>
              {funnel.map((item) => (
                <div key={item.label} className={styles.funnelRow}>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value.toLocaleString('es-ES')}</strong>
                  </div>
                  <i style={{ width: `${(item.value / maxFunnel) * 100}%` }} />
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.panel} ${styles.readoutPanel}`}>
            <div className={styles.panelHead}>
              <span>Lectura</span>
              <strong>Resumen publico</strong>
            </div>
            <ul>
              {readout.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <span>Voto</span>
              <strong>Distribucion guardada</strong>
            </div>
            <div className={styles.voteBars}>
              {voteSplit.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <i style={{ width: `${item.percent}%` }} />
                  <strong>{item.value.toLocaleString('es-ES')} / {item.percent.toLocaleString('es-ES')}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <span>Perfiles</span>
              <strong>Senal social</strong>
            </div>
            <div className={styles.barList}>
              {profileSignal.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <i style={{ width: `${(item.value / maxProfileSignal) * 100}%` }} />
                  <strong>{item.value.toLocaleString('es-ES')}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.panel} ${styles.widePanel}`}>
            <div className={styles.panelHead}>
              <span>Contenido</span>
              <strong>Votos por participacion</strong>
            </div>
            <div className={styles.contentTable}>
              {contentSignal.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <div><i style={{ width: `${(item.votes / maxContentVotes) * 100}%` }} /></div>
                  <strong>{item.votes.toLocaleString('es-ES')} votos</strong>
                  <em>{item.positive} positivo</em>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <span>Contenido</span>
              <strong>Atencion concentrada</strong>
            </div>
            <div className={styles.contentMetric}>
              <strong>303</strong>
              <span>votos fueron a perfiles con posts o pulses</span>
              <p>
                La senal publica es simple: participar con contenido aumento la
                evaluacion recibida, sin publicar aqui que contenido concreto lo hizo.
              </p>
            </div>
          </article>
        </section>

        <section className={styles.footerNote}>
          <p>
            WML 1.0 queda cerrado como archivo estadistico. El experimento activo
            ahora es WML X.X.0, una mascota local para Windows.
          </p>
        </section>
      </main>
    </>
  )
}
