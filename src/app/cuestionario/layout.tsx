import './quiz.css'

export const metadata = {
  title: 'Cuestionario — White Mirror Lab',
  description: 'Test de percepción social. Independiente del experimento WML 1.0.',
}

export default function CuestionarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="quiz-app">
      <header className="quiz-header">
        <a href="/" className="quiz-back">← Inicio</a>
        <span className="quiz-brand">White Mirror Lab</span>
      </header>
      <main className="quiz-main">{children}</main>
    </div>
  )
}
