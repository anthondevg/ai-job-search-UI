import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { analyzeOffer, getCvRecords, supabase } from './client'
import type { AnalyzeResponse, Compatibility, CvRecord } from './types'

const MIN_DESCRIPTION_LENGTH = 50

function recordName(record: CvRecord): string {
  return record.profile.personalInfo.name || record.fileName
}

function chanceLabel(score: number): string {
  if (score >= 75) return 'Buena oportunidad'
  if (score >= 55) return 'Oportunidad posible'
  return 'Baja compatibilidad'
}

function eligibilityLabel(value: Compatibility['location']['eligibility']): string {
  const labels = {
    eligible: 'Elegible',
    likely_eligible: 'Probablemente elegible',
    unclear: 'No está claro',
    unlikely: 'Poco probable',
    ineligible: 'No elegible',
  }
  return labels[value]
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      if (result.error) setError(result.error.message)
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'No se pudo iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="brand-mark">CV</div>
      <p className="eyebrow">CV Match Assistant</p>
      <h1>Analiza antes de aplicar</h1>
      <p className="muted">
        Usa la misma cuenta de tu workspace para acceder a tus CVs guardados.
      </p>

      <form className="login-form" onSubmit={(event) => void submit(event)}>
        <label>
          Correo
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="error-box">{error}</p>}
        <button className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  )
}

function Result({ result }: { result: AnalyzeResponse }) {
  const compatibility = result.compatibility
  if (!compatibility) return null

  return (
    <section className="result" aria-live="polite">
      <div className={`score score-${chanceLabel(compatibility.score).startsWith('Baja') ? 'low' : compatibility.score >= 75 ? 'high' : 'medium'}`}>
        <div>
          <span className="score-number">{compatibility.score}%</span>
          <span className="score-caption">compatibilidad</span>
        </div>
        <div className="score-copy">
          <strong>{chanceLabel(compatibility.score)}</strong>
          <span>{result.analysis.roleTitle || 'Oferta analizada'}</span>
        </div>
      </div>

      <p className="result-summary">{compatibility.summary}</p>

      <div className="location-card">
        <span>Ubicación y elegibilidad</span>
        <strong>{eligibilityLabel(compatibility.location.eligibility)}</strong>
        {compatibility.location.verdict && <p>{compatibility.location.verdict}</p>}
      </div>

      <div className="result-columns">
        <div>
          <h3>Fortalezas</h3>
          <ul>
            {compatibility.strengths.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h3>Brechas</h3>
          <ul className="gaps">
            {compatibility.gaps.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Workspace({ session }: { session: Session }) {
  const [records, setRecords] = useState<CvRecord[]>([])
  const [activeId, setActiveId] = useState('')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [isLoadingCvs, setIsLoadingCvs] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeRecord = useMemo(
    () => records.find((record) => record.id === activeId) ?? null,
    [activeId, records],
  )

  useEffect(() => {
    const storageKey = `cv-match-active:${session.user.id}`
    void getCvRecords()
      .then((nextRecords) => {
        setRecords(nextRecords)
        const savedId = localStorage.getItem(storageKey)
        setActiveId(
          nextRecords.some((record) => record.id === savedId)
            ? savedId!
            : nextRecords[0]?.id ?? '',
        )
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar tus CVs')
      })
      .finally(() => setIsLoadingCvs(false))
  }, [session.user.id])

  const selectRecord = (id: string) => {
    setActiveId(id)
    setResult(null)
    localStorage.setItem(`cv-match-active:${session.user.id}`, id)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeRecord || description.trim().length < MIN_DESCRIPTION_LENGTH) return

    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    try {
      setResult(await analyzeOffer(description.trim(), activeRecord))
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'No se pudo analizar la oferta')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="workspace">
      <header className="topbar">
        <div>
          <p className="eyebrow">CV Match Assistant</p>
          <h1>¿Vale la pena aplicar?</h1>
        </div>
        <button className="text-button" onClick={() => void supabase.auth.signOut()}>
          Salir
        </button>
      </header>

      <div className="safe-note">
        <span aria-hidden>✓</span>
        <p><strong>Modo seguro:</strong> no leemos ni modificamos LinkedIn. Tú controlas el texto que se analiza.</p>
      </div>

      {isLoadingCvs ? (
        <div className="panel muted">Cargando tus CVs…</div>
      ) : records.length === 0 ? (
        <div className="panel empty-state">
          <strong>No tienes CVs guardados</strong>
          <p>Importa primero un CV desde la aplicación principal.</p>
        </div>
      ) : (
        <form onSubmit={(event) => void submit(event)}>
          <label className="field-label" htmlFor="cv-select">CV para comparar</label>
          <select
            id="cv-select"
            value={activeId}
            onChange={(event) => selectRecord(event.target.value)}
          >
            {records.map((record) => (
              <option key={record.id} value={record.id}>
                {recordName(record)} — {record.fileName}
              </option>
            ))}
          </select>

          <div className="textarea-heading">
            <label className="field-label" htmlFor="job-description">Descripción de la oferta</label>
            <span>{description.length.toLocaleString('es')} caracteres</span>
          </div>
          <textarea
            id="job-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setResult(null)
            }}
            placeholder="Copia la descripción de la oferta y pégala aquí…"
            rows={12}
          />
          <p className="field-help">En LinkedIn: selecciona la descripción, copia con Ctrl+C y pega aquí con Ctrl+V.</p>

          {error && <p className="error-box">{error}</p>}

          <button
            className="primary-button analyze-button"
            disabled={!activeRecord || description.trim().length < MIN_DESCRIPTION_LENGTH || isAnalyzing}
          >
            {isAnalyzing ? 'Analizando compatibilidad…' : 'Analizar oferta'}
          </button>
        </form>
      )}

      {result && <Result result={result} />}
    </main>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    void supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session)
      setIsLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  if (isLoading) return <main className="loading-screen">Abriendo tu workspace…</main>
  return session ? <Workspace session={session} /> : <Login />
}
