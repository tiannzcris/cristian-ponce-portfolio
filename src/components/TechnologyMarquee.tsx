import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
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
  const contacts = useRef(new Set<number>())
  const [repetitions, setRepetitions] = useState(1)
  const [hovered, setHovered] = useState(false)
  const [touching, setTouching] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const shouldPause = hovered || touching || focused || reduced
  const pauseRef = useRef(shouldPause)

  useEffect(() => {
    // Capture releases outside the strip too. Native scrolling may cancel a touch pointer.
    const release = (event: PointerEvent) => {
      if (contacts.current.delete(event.pointerId)) setTouching(contacts.current.size > 0)
    }
    const clear = () => {
      contacts.current.clear()
      setTouching(false)
      setHovered(false)
    }
    const visibility = () => {
      if (document.hidden) clear()
    }
    window.addEventListener('pointerup', release, { capture: true, passive: true })
    window.addEventListener('pointercancel', release, { capture: true, passive: true })
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('pointerup', release, true)
      window.removeEventListener('pointercancel', release, true)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

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
      aria-describedby="technology-instructions"
      tabIndex={reduced ? undefined : 0}
      data-paused={shouldPause}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false)
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse') return
        contacts.current.add(event.pointerId)
        setTouching(true)
        setFocused(false)
      }}
      onFocusCapture={(event) => {
        // A touch can focus the region; only keyboard focus should keep it paused on release.
        setFocused(event.target.matches(':focus-visible'))
      }}
      onKeyDownCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <div className="marquee-heading container">
        <h2 id="technology-title">Technologies I work with</h2>
      </div>
      <p id="technology-instructions" className="sr-only">
        Hover, hold a touch, or focus this region with the keyboard to pause the moving list. Move
        away, release your touch, or move keyboard focus away to resume.
      </p>
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
