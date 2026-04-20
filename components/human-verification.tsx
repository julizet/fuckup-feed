'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CheckCircle2, Timer, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Extend JSX to accept the <altcha-widget> custom element
// ---------------------------------------------------------------------------
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          challengeurl?: string
          'hide-logo'?: string
          'hide-footer'?: string
          name?: string
          auto?: string
        },
        HTMLElement
      >
    }
  }
}

interface HumanVerificationProps {
  onVerified: (passed: boolean) => void
}

// ---------------------------------------------------------------------------
// Timer helpers
// ---------------------------------------------------------------------------
function randomTarget(): number {
  return Math.floor(Math.random() * 15) + 3 // 3–17 s
}

const TOLERANCE = 1.0

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function HumanVerification({ onVerified }: HumanVerificationProps) {
  // ── Step 1: ALTCHA ──────────────────────────────────────────────────────
  const [altchaVerified, setAltchaVerified] = useState(false)
  const [altchaError, setAltchaError]       = useState(false)
  const [altchaLoaded, setAltchaLoaded]     = useState(false)
  const widgetRef = useRef<HTMLElement>(null)

  // ── Step 2: Reaction timer ──────────────────────────────────────────────
  const [timerTarget, setTimerTarget] = useState(randomTarget)
  const [running, setRunning]         = useState(false)
  const [elapsed, setElapsed]         = useState(0)
  const [stopwatchResult, setStopwatchResult] = useState<'idle' | 'passed' | 'failed'>('idle')
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number | null>(null)

  const bothPassed = altchaVerified && stopwatchResult === 'passed'

  // Notify parent
  useEffect(() => {
    onVerified(bothPassed)
  }, [bothPassed, onVerified])

  // ── Load ALTCHA script once ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (document.querySelector('script[data-altcha]')) {
      setAltchaLoaded(true)
      return
    }
    const script = document.createElement('script')
    // Use altcha widget v2.3.0 — pairs with altcha-lib 1.4.x (v1 protocol)
    script.src  = 'https://cdn.jsdelivr.net/npm/altcha@2.3.0/dist/altcha.min.js'
    script.type = 'module'
    script.setAttribute('data-altcha', 'true')
    script.onload = () => setAltchaLoaded(true)
    script.onerror = () => setAltchaError(true)
    document.head.appendChild(script)
  }, [])

  // ── Listen for ALTCHA state changes ─────────────────────────────────────
  useEffect(() => {
    if (!altchaLoaded) return
    const widget = widgetRef.current
    if (!widget) return

    // 'verified' fires once the widget solves the PoW locally
    const handleVerified = () => {
      setAltchaVerified(true)
      setAltchaError(false)
    }

    // 'statechange' catches error states
    const handleStateChange = (ev: Event) => {
      const state = (ev as CustomEvent).detail?.state
      if (state === 'error' || state === 'expired') {
        setAltchaVerified(false)
        setAltchaError(true)
      }
    }

    widget.addEventListener('verified', handleVerified)
    widget.addEventListener('statechange', handleStateChange)
    return () => {
      widget.removeEventListener('verified', handleVerified)
      widget.removeEventListener('statechange', handleStateChange)
    }
  }, [altchaLoaded])

  // ── Timer tick ───────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (startRef.current === null) return
    setElapsed((Date.now() - startRef.current) / 1000)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  function startWatch() {
    if (running || stopwatchResult === 'passed') return
    startRef.current = Date.now()
    setElapsed(0)
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }

  function stopWatch() {
    if (!running) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setRunning(false)
    const final = startRef.current ? (Date.now() - startRef.current) / 1000 : 0
    setElapsed(final)
    const pass = Math.abs(final - timerTarget) <= TOLERANCE
    setStopwatchResult(pass ? 'passed' : 'failed')
    if (!pass) {
      setTimeout(() => {
        setTimerTarget(randomTarget())
        setElapsed(0)
        setStopwatchResult('idle')
      }, 1800)
    }
  }

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const progressPct = Math.min((elapsed / 20) * 100, 100)

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          Human Verification
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">Required before submitting</span>
      </div>

      {/* ── Step 1: ALTCHA proof-of-work ── */}
      <div className={cn(
        'rounded-lg border p-4 transition-colors',
        altchaVerified
          ? 'border-green-600/40 bg-green-900/10'
          : altchaError
            ? 'border-destructive/40 bg-destructive/10'
            : 'border-border',
      )}>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
            1
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Bot Check
          </span>
          {altchaVerified && <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />}
          {altchaError    && <AlertCircle  className="ml-auto h-4 w-4 text-destructive" />}
        </div>

        <p className="mb-3 text-xs text-muted-foreground">
          Your browser solves a short cryptographic puzzle automatically.
          No images, no tracking, no cookies — 100% privacy-friendly.
        </p>

        {altchaVerified ? (
          <p className="text-sm font-semibold text-green-400">Proof-of-work verified.</p>
        ) : altchaError ? (
          <p className="text-sm text-destructive">
            Verification failed. Please reload the page and try again.
          </p>
        ) : altchaLoaded ? (
          <altcha-widget
            ref={widgetRef}
            challengeurl="/api/altcha/challenge"
            hide-logo=""
            hide-footer=""
            auto="onload"
            style={{
              '--altcha-color-base':         'hsl(var(--card))',
              '--altcha-color-text':         'hsl(var(--foreground))',
              '--altcha-color-border':       'hsl(var(--border))',
              '--altcha-color-brand':        'hsl(var(--primary))',
              '--altcha-color-brand-active': 'hsl(var(--primary))',
              '--altcha-border-radius':      '0.5rem',
              '--altcha-border-width':       '1px',
              display: 'block',
              width: '100%',
            } as React.CSSProperties}
          />
        ) : (
          <div className="flex h-12 items-center justify-center rounded-lg border border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">Loading verification widget...</span>
          </div>
        )}
      </div>

      {/* ── Step 2: Reaction timer ── */}
      <div className={cn(
        'rounded-lg border p-4 transition-colors',
        stopwatchResult === 'passed'
          ? 'border-green-600/40 bg-green-900/10'
          : stopwatchResult === 'failed'
            ? 'border-destructive/40 bg-destructive/10'
            : 'border-border',
        !altchaVerified && 'pointer-events-none opacity-40',
      )}>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
            2
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Reaction Timer
          </span>
          {stopwatchResult === 'passed' && <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />}
          {stopwatchResult === 'failed' && <AlertCircle  className="ml-auto h-4 w-4 text-destructive" />}
        </div>

        {stopwatchResult === 'passed' ? (
          <p className="text-sm font-semibold text-green-400">
            Verified — stopped at {elapsed.toFixed(2)}s (target: {timerTarget}s).
          </p>
        ) : (
          <>
            <p className="mb-1 text-sm font-semibold text-foreground">
              Stop the timer at exactly{' '}
              <span className="font-black text-primary">{timerTarget} seconds</span>
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Tolerance: ±{TOLERANCE}s. A new random target is assigned after each failed attempt.
            </p>

            {/* Big timer display */}
            <div className="mb-3 flex items-center justify-center rounded-lg border border-border bg-background py-4">
              <Timer className={cn(
                'mr-2 h-5 w-5',
                running ? 'animate-pulse text-primary' : 'text-muted-foreground',
              )} />
              <span className={cn(
                'font-mono text-3xl font-black tabular-nums',
                running ? 'text-primary' : 'text-foreground',
              )}>
                {elapsed.toFixed(2)}s
              </span>
            </div>

            {/* Progress bar with target marker */}
            <div className="relative mb-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-none"
                style={{ width: `${progressPct}%` }}
              />
              <div
                className="absolute top-0 h-full w-0.5 bg-amber-400"
                style={{ left: `${(timerTarget / 20) * 100}%` }}
              />
            </div>
            <p className="mb-3 text-center text-[10px] text-muted-foreground">
              Amber marker = target ({timerTarget}s)
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={startWatch}
                disabled={running || stopwatchResult === 'failed'}
                className="flex-1 bg-secondary text-foreground hover:bg-secondary/80"
              >
                Start
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={stopWatch}
                disabled={!running}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Stop!
              </Button>
            </div>

            {stopwatchResult === 'failed' && (
              <p className="mt-2 text-center text-xs text-destructive">
                Stopped at {elapsed.toFixed(2)}s —{' '}
                {Math.abs(elapsed - timerTarget).toFixed(2)}s off. New target incoming...
              </p>
            )}
          </>
        )}
      </div>

      {/* All clear banner */}
      {bothPassed && (
        <div className="flex items-center gap-2 rounded-lg border border-green-600/40 bg-green-900/10 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="text-sm font-bold text-green-400">
            Human confirmed — you may now submit.
          </span>
        </div>
      )}
    </div>
  )
}
