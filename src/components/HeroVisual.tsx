import { useEffect, useRef, useState } from 'react'
import { Code2, Monitor, Pause, Play, Smartphone } from 'lucide-react'
import type { NetworkController } from './NetworkScene'

function StaticNetwork() {
  const nodes = Array.from({ length: 15 }, (_, i) => {
    const angle = (i / 15) * Math.PI * 2
    return {
      x: 300 + Math.cos(angle) * (i % 2 ? 127 : 157),
      y: 280 + Math.sin(angle) * (i % 2 ? 140 : 155),
    }
  })
  return (
    <svg className="static-network" viewBox="0 0 600 560" aria-hidden="true">
      <defs>
        <radialGradient id="orb-fill">
          <stop stopColor="#4669c3" stopOpacity=".45" />
          <stop offset="1" stopColor="#152033" stopOpacity=".2" />
        </radialGradient>
        <linearGradient id="orb-line">
          <stop stopColor="#77b7ff" />
          <stop offset="1" stopColor="#c2aeff" />
        </linearGradient>
      </defs>
      <circle cx="300" cy="280" r="155" fill="url(#orb-fill)" stroke="#799af5" strokeOpacity=".4" />
      <g fill="none" stroke="url(#orb-line)" strokeWidth="1" opacity=".65">
        <ellipse cx="300" cy="280" rx="225" ry="85" transform="rotate(-30 300 280)" />
        <ellipse cx="300" cy="280" rx="205" ry="86" transform="rotate(55 300 280)" />
        <ellipse cx="300" cy="280" rx="160" ry="70" transform="rotate(90 300 280)" />
        {nodes.map((n, i) => (
          <path
            key={i}
            d={`M${n.x},${n.y} L${nodes[(i + 4) % nodes.length].x},${nodes[(i + 4) % nodes.length].y}`}
            opacity=".4"
          />
        ))}
      </g>
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i % 3 === 0 ? 4 : 2.5}
          fill={i % 2 ? '#a8b6ff' : '#94ebf8'}
        />
      ))}
      <path
        d="m300 240 36 20v40l-36 20-36-20v-40z m-36 20 36 20 36-20 m-36 20v40"
        fill="#9caeff"
        fillOpacity=".08"
        stroke="#b9c9ff"
      />
    </svg>
  )
}

export default function HeroVisual() {
  const host = useRef<HTMLDivElement>(null)
  const controller = useRef<NetworkController | null>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(preference.matches)
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    let cancelled = false
    let started = false
    const element = host.current!
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return
        started = true
        // Split Three.js into a separate chunk; never hold up the page or its controls.
        import('./NetworkScene')
          .then(({ createNetwork }) => {
            if (cancelled) return
            controller.current = createNetwork(element, () => setReady(false))
            if (controller.current) setReady(true)
          })
          .catch(() => {
            /* The HTML/SVG illustration remains available. */
          })
      },
      { rootMargin: '80px' },
    )
    observer.observe(element)
    return () => {
      cancelled = true
      observer.disconnect()
      controller.current?.dispose()
      controller.current = null
    }
  }, [])

  useEffect(() => {
    controller.current?.setPaused(paused || reduced)
  }, [paused, reduced, ready])

  return (
    <div className={`hero-visual ${ready ? 'scene-ready' : ''}`}>
      <div className="visual-grid" aria-hidden="true" />
      <div className="visual-coordinate coordinate-top" aria-hidden="true">
        IDEAS, INTERCONNECTED.
      </div>
      <div className="network-fallback">
        <StaticNetwork />
      </div>
      <div ref={host} className="network-canvas" aria-hidden="true" />
      <div className="orbit-label label-web">
        <Code2 size={17} />
        <span>WEB</span>
      </div>
      <div className="orbit-label label-mobile">
        <Smartphone size={16} />
        <span>MOBILE</span>
      </div>
      <div className="orbit-label label-desktop">
        <Monitor size={17} />
        <span>DESKTOP</span>
      </div>
      <div className="visual-footer">
        <span className="visual-caption">
          <span className="tiny-star">✳</span> CONNECTING IDEAS TO APPLICATIONS
        </span>
        {ready && !reduced && (
          <button
            className="scene-pause icon-button"
            onClick={() => setPaused(!paused)}
            aria-label={paused ? 'Play 3D animation' : 'Pause 3D animation'}
            aria-pressed={paused}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}
