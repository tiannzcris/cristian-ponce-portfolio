import { useEffect, useRef } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { navigation } from '../content'
import ThemeToggle from './ThemeToggle'

export default function Navigation({
  open,
  onMenuChange: setOpen,
}: {
  open: boolean
  onMenuChange: (open: boolean) => void
}) {
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 801px)')
    const onResize = () => {
      if (desktop.matches) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', outside)
    desktop.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', outside)
      desktop.removeEventListener('change', onResize)
    }
  }, [open, setOpen])

  function navigate(id: string) {
    setOpen(false)
    // Move keyboard focus with the anchor, instead of leaving it inside a hidden menu.
    window.requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: true }))
  }

  return (
    <header className="site-header" ref={header}>
      <div className="header-inner container">
        <a
          href="#home"
          className="wordmark"
          aria-label="Cristian N. Ponce, home"
          onClick={() => navigate('home')}
        >
          cnp<span className="wordmark-dot">.</span>
          <span className="wordmark-line" />
          <span className="wordmark-label">CRISTIAN N. PONCE</span>
        </a>
        <nav
          id="primary-navigation"
          className={`primary-nav ${open ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          {navigation.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => navigate(label.toLowerCase())}
            >
              {label}
              {label === 'Contact' && <ArrowUpRight size={15} />}
            </a>
          ))}
        </nav>
        <div className="navigation-actions">
          <ThemeToggle />
          <button
            ref={toggle}
            className="menu-toggle icon-button"
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}
