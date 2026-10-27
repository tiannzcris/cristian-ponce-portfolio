import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Pause, Play, UserRound, X } from 'lucide-react'
import CompanionFallback from './CompanionFallback'
import type { CompanionController } from './types'
import { useDockPosition } from './useDockPosition'

export default function PortfolioCompanion({ suppressed }: { suppressed: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const dock = useRef<HTMLElement>(null)
  const restoreButton = useRef<HTMLButtonElement>(null)
  const greetButton = useRef<HTMLButtonElement>(null)
  const hideButton = useRef<HTMLButtonElement>(null)
  const controller = useRef<CompanionController | null>(null)
  const [hidden, setHidden] = useState(false)
  const [ready, setReady] = useState(false)
  const [contentBusy, setContentBusy] = useState(false)
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [choice, setChoice] = useState<'system' | 'on' | 'off'>('system')
  const moving = choice === 'on' || (choice === 'system' && !reduced)
  const suspended = suppressed || contentBusy
  const visible = !hidden && !suspended
  const position = useDockPosition(dock, !suspended)
  const desired = useRef({ moving, visible })

  useEffect(() => {
    // Full-width certificate rows and the footer leave no safe rail on narrow screens.
    // Tuck the companion away while reading them; restore it automatically afterwards.
    const occupied = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) =>
        entry.isIntersecting ? occupied.add(entry.target) : occupied.delete(entry.target),
      )
      setContentBusy(occupied.size > 0)
    })
    document
      .querySelectorAll('.certificate-list, .site-footer')
      .forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    desired.current = { moving, visible }
    controller.current?.setState({ moving, visible })
  }, [moving, visible, ready])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => {
      setReduced(media.matches)
      // A newly enabled OS reduction takes priority over an earlier Play click.
      if (media.matches) setChoice('system')
    }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    let cancelled = false
    const start = () => {
      import('./companionScene')
        .then(({ createCompanionScene }) => {
          if (cancelled || !host.current) return
          controller.current = createCompanionScene(host.current, () => setReady(false))
          if (controller.current) {
            controller.current.setState(desired.current)
            setReady(true)
          }
        })
        .catch(() => {
          /* The static fallback and hide control remain usable. */
        })
    }
    const timer = window.setTimeout(start, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.current?.dispose()
      controller.current = null
    }
  }, [])

  return (
    <aside
      ref={dock}
      className={`companion-dock ${ready ? 'companion-ready' : ''}`}
      aria-label="Portfolio companion"
      hidden={suspended}
      style={
        {
          '--dock-bottom': `${position.bottom}px`,
          '--dock-right': `${position.right}px`,
        } as CSSProperties
      }
    >
      <div className="companion-visible" hidden={hidden}>
        <div className="companion-stage">
          <CompanionFallback />
          <div className="companion-canvas" ref={host} aria-hidden="true" />
          <button
            ref={greetButton}
            className="companion-greet"
            type="button"
            disabled={!ready}
            aria-label="Wave with Cristian’s companion"
            title={ready ? 'Say hello' : 'Static companion'}
            onClick={() => controller.current?.wave()}
          />
        </div>
        <div className="companion-controls" role="group" aria-label="Companion controls">
          <button
            className="icon-button"
            type="button"
            disabled={!ready}
            onClick={() => setChoice(moving ? 'off' : 'on')}
            aria-label={
              moving
                ? 'Pause companion animation'
                : reduced
                  ? 'Enable companion movement'
                  : 'Resume companion animation'
            }
            title={moving ? 'Pause companion' : reduced ? 'Enable movement' : 'Resume companion'}
          >
            {moving ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            ref={hideButton}
            className="icon-button"
            type="button"
            aria-label="Hide companion"
            title="Hide companion"
            onClick={() => {
              setHidden(true)
              requestAnimationFrame(() => restoreButton.current?.focus())
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
      <button
        ref={restoreButton}
        className="companion-restore icon-button"
        hidden={!hidden}
        type="button"
        aria-label="Restore companion"
        title="Show companion"
        onClick={() => {
          setHidden(false)
          requestAnimationFrame(() => {
            if (greetButton.current && !greetButton.current.disabled) greetButton.current.focus()
            else hideButton.current?.focus()
          })
        }}
      >
        <UserRound size={18} />
      </button>
    </aside>
  )
}
