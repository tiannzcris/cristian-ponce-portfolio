import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { backgroundMusic } from '../companion/config'

type MusicPreferences = { volume: number; muted: boolean; pausedByUser: boolean }
const storageKey = 'cnp-music-preferences'

function readPreferences(): MusicPreferences {
  const defaults = { volume: backgroundMusic.defaultVolume, muted: false, pausedByUser: false }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (!saved || typeof saved !== 'object') return defaults
    return {
      volume:
        typeof saved.volume === 'number' && Number.isFinite(saved.volume)
          ? Math.max(0, Math.min(1, saved.volume))
          : defaults.volume,
      muted: typeof saved.muted === 'boolean' ? saved.muted : defaults.muted,
      pausedByUser: saved.pausedByUser === true,
    }
  } catch {
    return defaults
  }
}

export default function MusicPlayer({ suppressed }: { suppressed: boolean }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [preferences, setPreferences] = useState(readPreferences)
  const initialPreferences = useRef(preferences)
  const autoplayAttempted = useRef(false)
  const playRequest = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [pending, setPending] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startPlayback = useCallback(async () => {
    const element = audio.current
    if (!element) return
    const request = ++playRequest.current
    setPending(true)
    setBlocked(false)
    setError(null)
    try {
      await element.play()
      // Only the playing event changes the UI to Pause: a resolved request alone is insufficient.
    } catch (failure) {
      if (request !== playRequest.current) return
      setPlaying(false)
      if (failure instanceof DOMException && failure.name === 'NotAllowedError') setBlocked(true)
      else setError('Music could not start. Press Play music to try again.')
    } finally {
      if (request === playRequest.current) setPending(false)
    }
  }, [])

  useEffect(() => {
    const element = audio.current!
    element.volume = initialPreferences.current.volume
    element.muted = initialPreferences.current.muted
    element.src = backgroundMusic.src
    // Defer once so StrictMode's setup/cleanup replay cannot produce two startup play requests.
    const timer = window.setTimeout(() => {
      if (autoplayAttempted.current) return
      autoplayAttempted.current = true
      if (!initialPreferences.current.pausedByUser) void startPlayback()
    }, 0)
    return () => {
      clearTimeout(timer)
      playRequest.current += 1
      element.pause()
      element.removeAttribute('src')
      element.load()
    }
  }, [startPlayback])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences))
    } catch {
      // Storage may be unavailable; controls still work for this visit.
    }
  }, [preferences])

  function toggle() {
    const element = audio.current
    if (!element) return
    autoplayAttempted.current = true
    if (!element.paused) {
      playRequest.current++
      element.pause()
      setPlaying(false)
      setPending(false)
      setBlocked(false)
      setPreferences((previous) => ({ ...previous, pausedByUser: true }))
    } else {
      setPreferences((previous) => ({ ...previous, pausedByUser: false }))
      if (element.error) element.load()
      void startPlayback()
    }
  }

  const message = error
    ? error
    : blocked
      ? 'Autoplay was blocked. Press Play music to listen.'
      : pending
        ? 'Loading music…'
        : playing
          ? 'Music playing.'
          : preferences.pausedByUser
            ? 'Music paused.'
            : loaded
              ? 'Press Play music to listen.'
              : 'Loading music…'

  return (
    <>
      <audio
        ref={audio}
        preload="metadata"
        loop
        hidden
        onLoadedMetadata={() => setLoaded(true)}
        onPlaying={() => {
          setPlaying(true)
          setPending(false)
          setBlocked(false)
          setError(null)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onVolumeChange={() => {
          const element = audio.current
          if (element)
            setPreferences((previous) => ({
              ...previous,
              volume: element.volume,
              muted: element.muted,
            }))
        }}
        onError={() => {
          playRequest.current++
          setPending(false)
          setPlaying(false)
          setLoaded(false)
          setError('Music is unavailable. The audio file could not be loaded.')
        }}
      />
      <div className="music-widget" hidden={suppressed}>
        <div className="music-player" role="group" aria-label="Background music">
          <button
            className="music-play"
            type="button"
            aria-label={playing ? 'Pause music' : 'Play music'}
            disabled={pending && !playing}
            onClick={toggle}
          >
            {playing ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            <span>{playing ? 'Pause music' : pending ? 'Starting…' : 'Play music'}</span>
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={preferences.muted ? 'Unmute music' : 'Mute music'}
            aria-pressed={preferences.muted}
            onClick={() => {
              if (audio.current) {
                const muted = !audio.current.muted
                audio.current.muted = muted
                setPreferences((previous) => ({ ...previous, muted }))
              }
            }}
          >
            {preferences.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <label className="music-volume" htmlFor="music-volume">
            <span className="sr-only">Background music volume</span>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={preferences.volume}
              onChange={(event) => {
                const volume = Number(event.target.value)
                if (audio.current) audio.current.volume = volume
                setPreferences((previous) => ({ ...previous, volume }))
              }}
            />
            <span aria-hidden="true">{Math.round(preferences.volume * 100)}%</span>
          </label>
        </div>
        <p className="music-status" role="status">
          {message}
        </p>
      </div>
    </>
  )
}
