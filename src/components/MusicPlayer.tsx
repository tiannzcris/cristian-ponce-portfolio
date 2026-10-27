import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { backgroundMusic } from '../companion/config'

export default function MusicPlayer({ suppressed }: { suppressed: boolean }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [valid, setValid] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [pending, setPending] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.25)
  const [verifiedSource, setVerifiedSource] = useState<string | null>(null)
  useEffect(() => {
    const src = backgroundMusic.src
    if (!src || !src.startsWith('/audio/')) return
    const abort = new AbortController()
    fetch(src, { method: 'HEAD', signal: abort.signal })
      .then((response) => {
        if (
          !abort.signal.aborted &&
          response.ok &&
          /^audio\//i.test(response.headers.get('content-type') ?? '')
        )
          setVerifiedSource(src)
      })
      .catch(() => {
        /* Missing or invalid tracks leave the player hidden. */
      })
    return () => abort.abort()
  }, [])
  useEffect(() => {
    const element = audio.current
    return () => {
      element?.pause()
      element?.removeAttribute('src')
      element?.load()
    }
  }, [verifiedSource])
  async function toggle() {
    const element = audio.current
    if (!element) return
    if (!element.paused) {
      element.pause()
      return
    }
    setPending(true)
    try {
      await element.play()
    } catch {
      setPlaying(false)
    } finally {
      setPending(false)
    }
  }
  if (!verifiedSource) return null
  return (
    <>
      <audio
        ref={audio}
        src={verifiedSource}
        preload="metadata"
        loop
        hidden
        onLoadedMetadata={() => {
          if (audio.current) {
            audio.current.volume = volume
            setValid(true)
          }
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setValid(false)
          setPlaying(false)
        }}
      />
      {valid && (
        <div
          className="music-player"
          role="group"
          aria-label="Background music"
          hidden={suppressed}
        >
          <button
            className="icon-button"
            type="button"
            aria-label={playing ? 'Pause background music' : 'Play background music'}
            disabled={pending}
            onClick={toggle}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={muted ? 'Unmute background music' : 'Mute background music'}
            onClick={() => {
              if (audio.current) {
                audio.current.muted = !muted
                setMuted(!muted)
              }
            }}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <label className="sr-only" htmlFor="music-volume">
            Background music volume
          </label>
          <input
            id="music-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => {
              const value = Number(event.target.value)
              setVolume(value)
              if (audio.current) audio.current.volume = value
            }}
          />
        </div>
      )}
    </>
  )
}
