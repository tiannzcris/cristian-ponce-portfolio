import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** Keep the floating character clear of visible links/buttons, including footer controls. */
export function useDockPosition(ref: RefObject<HTMLElement | null>, visible: boolean) {
  const [position, setPosition] = useState({ bottom: 12, right: 12 })
  useEffect(() => {
    if (!visible) return
    let frame = 0
    function measure() {
      frame = 0
      const element = ref.current
      if (!element) return
      const { width, height } = element.getBoundingClientRect()
      if (!width || !height) return
      const obstacles = Array.from(
        document.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,summary'),
      )
        .filter(
          (target) =>
            !element.contains(target) &&
            target.getClientRects().length &&
            !target.closest('[hidden]'),
        )
        .map((target) => target.getBoundingClientRect())
        .filter((box) => box.bottom > 0 && box.top < innerHeight && box.width && box.height)
      let best = { bottom: 12, right: 12 },
        penalty = Infinity
      const candidates = [12, 24 + width]
        .flatMap((right) => [12, 72, 132, 192, 252].map((bottom) => ({ right, bottom })))
        .sort((a, b) => a.right + a.bottom - b.right - b.bottom)
      for (const { right, bottom } of candidates) {
        if (right + width > innerWidth - 8) continue
        const box = {
          left: innerWidth - right - width,
          right: innerWidth - right,
          top: innerHeight - bottom - height,
          bottom: innerHeight - bottom,
        }
        if (box.top < 88) continue
        const count = obstacles.filter(
          (other) =>
            box.left < other.right + 12 &&
            box.right > other.left - 12 &&
            box.top < other.bottom + 12 &&
            box.bottom > other.top - 12,
        ).length
        if (count < penalty) {
          penalty = count
          best = { bottom, right }
        }
        if (!count) break
      }
      setPosition((previous) =>
        previous.bottom === best.bottom && previous.right === best.right ? previous : best,
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    const controls = new MutationObserver(schedule)
    controls.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'aria-expanded'],
    })
    if (ref.current) observer.observe(ref.current)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ref, visible])
  return position
}
