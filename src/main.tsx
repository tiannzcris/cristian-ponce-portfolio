import React from 'react'
import ReactDOM from 'react-dom/client'
import './fonts.css'
import './themes.css'
import App from './App'
import './styles.css'
import './companion/companion.css'
import { initializeTheme } from './theme'

const stopTheme = initializeTheme()
if (import.meta.hot) import.meta.hot.dispose(stopTheme)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
