'use client'

import { useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { captureEvent } from '@/lib/posthog'

type Answers = Record<string, number>

const quiz = {
  es: {
    label: 'Cuestionario',
    resultLabel: 'Resultado',
    title: 'Test de percepcion social',
    description: 'Responde con sinceridad. No hay respuestas correctas ni incorrectas.',
    score: 'Puntuacion',
    retry: 'Repetir test',
    submit: 'Ver resultado',
    questions: [
      {
        id: 'q1',
        text: 'Te importa lo que piensen de ti personas que no conoces?',
        options: [
          { text: 'Mucho', score: 3 },
          { text: 'Algo', score: 2 },
          { text: 'Poco', score: 1 },
          { text: 'Nada', score: 0 },
        ],
      },
      {
        id: 'q2',
        text: 'Si pudieras votar anonimamente sobre alguien, lo harias?',
        options: [
          { text: 'Si, sin dudarlo', score: 3 },
          { text: 'Depende de la persona', score: 2 },
          { text: 'Probablemente no', score: 1 },
          { text: 'Nunca', score: 0 },
        ],
      },
      {
        id: 'q3',
        text: 'Crees que una puntuacion publica cambia como actua la gente?',
        options: [
          { text: 'Totalmente', score: 3 },
          { text: 'En parte', score: 2 },
          { text: 'Muy poco', score: 1 },
          { text: 'Para nada', score: 0 },
        ],
      },
      {
        id: 'q4',
        text: 'Prefieres dar feedback positivo o negativo?',
        options: [
          { text: 'Siempre positivo', score: 0 },
          { text: 'Mayormente positivo', score: 1 },
          { text: 'Equilibrado', score: 2 },
          { text: 'No tengo preferencia / negativo', score: 3 },
        ],
      },
      {
        id: 'q5',
        text: 'Participarias en un experimento social aunque pudieras perder reputacion?',
        options: [
          { text: 'Si, me intriga', score: 3 },
          { text: 'Con condiciones', score: 2 },
          { text: 'Dudaria mucho', score: 1 },
          { text: 'No participaria', score: 0 },
        ],
      },
    ],
    results: [
      { min: 0, max: 5, title: 'Observador pasivo', description: 'Tiendes a mantenerte al margen del juicio social. Probablemente observes el experimento mas de lo que participas activamente.' },
      { min: 6, max: 10, title: 'Participante cauteloso', description: 'Te interesa la dinamica social pero actuas con mesura. Tu comportamiento en WML 1.0 podria ser mas reflexivo que impulsivo.' },
      { min: 11, max: 15, title: 'Agente social activo', description: 'La opinion ajena y la reputacion te importan. Eres un candidato a participar intensamente en el karma score, para bien o para mal.' },
    ],
  },
  en: {
    label: 'Questionnaire',
    resultLabel: 'Result',
    title: 'Social perception test',
    description: 'Answer honestly. There are no right or wrong answers.',
    score: 'Score',
    retry: 'Retake test',
    submit: 'See result',
    questions: [
      {
        id: 'q1',
        text: 'Do you care what strangers think about you?',
        options: [
          { text: 'A lot', score: 3 },
          { text: 'Somewhat', score: 2 },
          { text: 'A little', score: 1 },
          { text: 'Not at all', score: 0 },
        ],
      },
      {
        id: 'q2',
        text: 'If you could anonymously vote on someone, would you?',
        options: [
          { text: 'Yes, without hesitation', score: 3 },
          { text: 'Depends on the person', score: 2 },
          { text: 'Probably not', score: 1 },
          { text: 'Never', score: 0 },
        ],
      },
      {
        id: 'q3',
        text: 'Do you think a public score changes how people behave?',
        options: [
          { text: 'Completely', score: 3 },
          { text: 'Partly', score: 2 },
          { text: 'Very little', score: 1 },
          { text: 'Not at all', score: 0 },
        ],
      },
      {
        id: 'q4',
        text: 'Do you prefer giving positive or negative feedback?',
        options: [
          { text: 'Always positive', score: 0 },
          { text: 'Mostly positive', score: 1 },
          { text: 'Balanced', score: 2 },
          { text: 'No preference / negative', score: 3 },
        ],
      },
      {
        id: 'q5',
        text: 'Would you join a social experiment even if you could lose reputation?',
        options: [
          { text: 'Yes, I am intrigued', score: 3 },
          { text: 'With conditions', score: 2 },
          { text: 'I would hesitate', score: 1 },
          { text: 'I would not participate', score: 0 },
        ],
      },
    ],
    results: [
      { min: 0, max: 5, title: 'Passive observer', description: 'You tend to stay on the sidelines of social judgment. You may observe the experiment more than actively participate.' },
      { min: 6, max: 10, title: 'Careful participant', description: 'You are interested in social dynamics but act with restraint. Your behavior in WML 1.0 may be more reflective than impulsive.' },
      { min: 11, max: 15, title: 'Active social agent', description: 'Other people opinion and reputation matter to you. You may participate intensely in the karma score, for better or worse.' },
    ],
  },
} as const

export default function CuestionarioPage() {
  const lang = useLocale()
  const t = quiz[lang]
  const [answers, setAnswers] = useState<Answers>({})
  const [done, setDone] = useState(false)

  const allAnswered = t.questions.every((q) => answers[q.id] !== undefined)
  const maxScore = t.questions.length * 3

  const getResult = () => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0)
    const result = t.results.find((r) => total >= r.min && total <= r.max)
    return { total, result }
  }

  const handleSubmit = () => {
    const { total, result } = getResult()
    setDone(true)
    captureEvent('quiz_completed', { score: total, result: result?.title, locale: lang })
  }

  if (done) {
    const { total, result } = getResult()

    return (
      <div>
        <div className="quiz-label">{t.resultLabel}</div>
        <div className="quiz-card">
          <div className="quiz-result-title">{result?.title ?? t.resultLabel}</div>
          <p className="quiz-result-desc">{result?.description}</p>
          <div className="quiz-score">
            {t.score}: {total} / {maxScore}
          </div>
        </div>
        <button
          type="button"
          className="quiz-retry"
          onClick={() => { setAnswers({}); setDone(false) }}
        >
          {t.retry}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="quiz-label">{t.label}</div>
      <h1 className="quiz-title">{t.title}</h1>
      <p className="quiz-desc">{t.description}</p>

      {t.questions.map((q, qi) => (
        <div key={q.id} className="quiz-card">
          <div className="quiz-q">{qi + 1}. {q.text}</div>
          {q.options.map((opt) => (
            <button
              key={opt.text}
              type="button"
              className={`quiz-opt${answers[q.id] === opt.score ? ' selected' : ''}`}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
            >
              {opt.text}
            </button>
          ))}
        </div>
      ))}

      <button
        type="button"
        className="quiz-submit"
        disabled={!allAnswered}
        onClick={handleSubmit}
      >
        {t.submit}
      </button>
    </div>
  )
}
