import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
export const themeStorageKey = 'cnp-theme'
const themeEvent = 'cnp:theme-change'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function storedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(themeStorageKey)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0a0c12' : '#f7f8fc')
  window.dispatchEvent(new Event(themeEvent))
}

export function setTheme(theme: Theme) {
  // A blocked storage API must not prevent this session's theme from changing.
  explicitChoice = theme
  try {
    localStorage.setItem(themeStorageKey, theme)
  } catch {
    /* In-memory preference still works. */
  }
  applyTheme(theme)
}

let explicitChoice = storedTheme()

// The early head script has already applied the initial preference before first paint.
export function initializeTheme() {
  const preference = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemChange = () => {
    if (!explicitChoice) applyTheme(systemTheme())
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== themeStorageKey && event.key !== null) return
    explicitChoice = storedTheme()
    applyTheme(explicitChoice ?? systemTheme())
  }
  preference.addEventListener('change', onSystemChange)
  window.addEventListener('storage', onStorage)
  return () => {
    preference.removeEventListener('change', onSystemChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener(themeEvent, callback)
  return () => window.removeEventListener(themeEvent, callback)
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, currentTheme)
}
