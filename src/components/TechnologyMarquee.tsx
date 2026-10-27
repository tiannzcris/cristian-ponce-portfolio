import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Pause, Play } from 'lucide-react'
import { technologies } from '../content'
import type { Technology } from '../content'

function TechnologyLogo({ technology }: { technology: Technology }) {
  if (!technology.icon) return null
  return (
    <span
      className={`technology-logo technology-${technology.icon}`}
      style={{ '--logo': `url('/icons/technologies/${technology.icon}.svg')` } as CSSProperties}
      aria-hidden="true"
    />
  )
}

export default function TechnologyMarquee() {
  const viewport = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const sequence = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const animation = useRef<Animation | null>(null)
  const [repetitions, setRepetitions] = useState(1)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const shouldPause = paused || hovered || focused || reduced
  const pauseRef = useRef(shouldPause)

  useEffect(() => {
    pauseRef.current = shouldPause
    if (shouldPause) animation.current?.pause()
    else animation.current?.play()
  }, [shouldPause])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(preference.matches)
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (reduced) return
    let distance = 0
    let duration = 0
    const measure = () => {
      const unit = sequence.current!.getBoundingClientRect().width
      if (!unit) return
      const count = Math.max(1, Math.ceil(viewport.current!.clientWidth / unit))
      if (count !== repetitions) {
        setRepetitions(count)
        return
      }
      const width = group.current!.getBoundingClientRect().width
      if (width === distance && animation.current) return
      const progress =
        duration && animation.current
          ? (Number(animation.current.currentTime) % duration) / duration
          : 0
      distance = width
      duration = (width / 44) * 1000
      animation.current?.cancel()
      animation.current = track.current!.animate(
        [{ transform: 'translateX(0)' }, { transform: `translateX(-${width}px)` }],
        { duration, iterations: Infinity, easing: 'linear' },
      )
      animation.current.currentTime = progress * duration
      if (pauseRef.current) animation.current.pause()
    }
    const observer = new ResizeObserver(measure)
    observer.observe(viewport.current!)
    observer.observe(sequence.current!)
    observer.observe(group.current!)
    return () => {
      observer.disconnect()
      animation.current?.cancel()
      animation.current = null
    }
  }, [repetitions, reduced])

  const items = technologies.map((technology) => (
    <span className="technology-item" key={technology.name}>
      <TechnologyLogo technology={technology} />
      <span>{technology.name}</span>
    </span>
  ))

  return (
    <section
      className="technology-marquee"
      aria-labelledby="technology-title"
      data-paused={shouldPause}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <div className="marquee-heading container">
        <h2 id="technology-title">Technologies I work with</h2>
        <button
          type="button"
          className="marquee-control"
          aria-label={paused ? 'Resume technology marquee' : 'Pause technology marquee'}
          aria-pressed={paused}
          disabled={reduced}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          <span>{reduced ? 'Motion reduced' : paused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>
      <ul className="technology-accessible-list" role="list" aria-label="Technologies I work with">
        {technologies.map((technology) => (
          <li key={technology.name}>
            <TechnologyLogo technology={technology} />
            {technology.name}
          </li>
        ))}
      </ul>
      <div className="marquee-viewport" ref={viewport} aria-hidden="true">
        <div className="marquee-track" ref={track}>
          {[0, 1].map((copy) => (
            <div className="marquee-group" ref={copy === 0 ? group : undefined} key={copy}>
              {Array.from({ length: repetitions }, (_, index) => (
                <div
                  className="marquee-sequence"
                  ref={copy === 0 && index === 0 ? sequence : undefined}
                  key={index}
                >
                  {items}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
