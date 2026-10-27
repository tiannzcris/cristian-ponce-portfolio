import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CompanionFallback from './CompanionFallback'
import type { CompanionController } from './types'

export default function PortfolioCompanion() {
  const host = useRef<HTMLDivElement>(null)
  const controller = useRef<CompanionController | null>(null)
  const [ready, setReady] = useState(false)
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const desired = useRef({ moving: !reduced, visible: true })

  useEffect(() => {
    desired.current = { moving: !reduced, visible: true }
    controller.current?.setState(desired.current)
  }, [reduced, ready])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
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
          /* Keep the static fallback if the lazy scene cannot load. */
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

  // Escape page transforms; native modal dialogs remain above this normal document layer.
  return createPortal(
    <aside
      className={`companion-dock ${ready ? 'companion-ready' : ''}`}
      aria-label="Portfolio companion"
    >
      <div className="companion-stage">
        <CompanionFallback />
        <div className="companion-canvas" ref={host} aria-hidden="true" />
        <button
          className="companion-greet"
          type="button"
          disabled={!ready}
          aria-label="Wave with Cristian’s companion"
          title={ready ? 'Say hello' : 'Static companion'}
          onClick={() => controller.current?.wave()}
        />
      </div>
    </aside>,
    document.body,
  )
}
