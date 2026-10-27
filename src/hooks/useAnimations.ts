import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useAnimations() {
  useEffect(() => {
    const media = gsap.matchMedia()
    try {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hero-intro > *', {
          y: 22,
          opacity: 0.45,
          duration: 1,
          stagger: 0.09,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        })
        gsap.from('.hero-visual', {
          y: 18,
          opacity: 0.4,
          duration: 1.5,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        })
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
          ScrollTrigger.create({
            trigger: element,
            start: 'top 92%',
            once: true,
            onEnter: () => {
              gsap.fromTo(
                element,
                { y: 25, opacity: 0.55 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.85,
                  ease: 'power2.out',
                  clearProps: 'transform,opacity',
                },
              )
            },
          })
        })
      })
      media.add('(min-width: 801px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.project-visual img').forEach((image) => {
          gsap.fromTo(
            image,
            { yPercent: 2 },
            {
              yPercent: -2,
              ease: 'none',
              scrollTrigger: {
                trigger: image.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )
        })
      })
    } catch {
      // Animation is progressive enhancement. Restore visible HTML if setup fails.
      media.revert()
    }
    return () => media.revert()
  }, [])
}
