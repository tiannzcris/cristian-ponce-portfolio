import { Moon, Sun } from 'lucide-react'
import { setTheme, useTheme } from '../theme'

export default function ThemeToggle() {
  const theme = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      className="theme-toggle icon-button"
      type="button"
      aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
      title={`Switch to ${dark ? 'light' : 'dark'} theme`}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </button>
  )
}
