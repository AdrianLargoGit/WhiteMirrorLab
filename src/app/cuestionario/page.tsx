'use client'

import { useState } from 'react'
import quiz from '@/data/cuestionario.json'
import { captureEvent } from '@/lib/analytics'

type Answers = Record<string, number>

export default function CuestionarioPage() {
  const [answers, setAnswers] = useState<Answers>({})
  const [done, setDone] = useState(false)

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined)

  const handleSubmit = () => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0)
    const result = quiz.results.find((r) => total >= r.min && total <= r.max)
    setDone(true)
    captureEvent('quiz_completed', { score: total, result: result?.title })
  }

  if (done) {
    const total = Object.values(answers).reduce((a, b) => a + b, 0)
    const result = quiz.results.find((r) => total >= r.min && total <= r.max)

    return (
      <div>
        <div className="quiz-label">Resultado</div>
        <div className="quiz-card">
          <div className="quiz-result-title">{result?.title ?? 'Resultado'}</div>
          <p className="quiz-result-desc">{result?.description}</p>
          <div className="quiz-score">
            Puntuación: {total} / {quiz.questions.length * 3}
          </div>
        </div>
        <button
          type="button"
          className="quiz-retry"
          onClick={() => { setAnswers({}); setDone(false) }}
        >
          Repetir test
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="quiz-label">Cuestionario</div>
      <h1 className="quiz-title">{quiz.title}</h1>
      <p className="quiz-desc">{quiz.description}</p>

      {quiz.questions.map((q, qi) => (
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
        Ver resultado
      </button>
    </div>
  )
}
