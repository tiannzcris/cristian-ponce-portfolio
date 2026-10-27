import * as THREE from 'three'
import { currentTheme, subscribeTheme } from '../theme'
import { createProceduralCharacter } from './proceduralCharacter'
import { isRendering, setRendering } from './renderBudget'
import type { CompanionController } from './types'

export function createCompanionScene(
  host: HTMLElement,
  onFailure: () => void,
): CompanionController | null {
  const canvas = document.createElement('canvas')
  let renderer: THREE.WebGLRenderer
  try {
    const context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    if (!context) return null
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true })
  } catch {
    return null
  }
  renderer.setClearColor(0, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  host.appendChild(canvas)
  const scene = new THREE.Scene()
  // The procedural factory is the only character-specific dependency of this renderer.
  const character = createProceduralCharacter()
  scene.add(character.root)
  const camera = new THREE.OrthographicCamera(-1.4, 1.4, 3.15, -0.15, 0.1, 20)
  camera.position.set(0.5, 1.8, 7)
  camera.lookAt(0, 1.4, 0)
  const ambient = new THREE.HemisphereLight(undefined, undefined, 2)
  const key = new THREE.DirectionalLight(undefined, 3)
  key.position.set(-3, 4, 5)
  const fill = new THREE.DirectionalLight(undefined, 1.6)
  fill.position.set(3, 2, -3)
  scene.add(ambient, key, fill)
  const groundGeometry = new THREE.CircleGeometry(0.43, 32)
  const groundMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.scale.set(1, 0.65, 1)
  ground.position.y = -0.005
  scene.add(ground)

  let moving = false
  let visible = true
  let disposed = false
  let lost = false
  let running = false
  let frame = 0
  let elapsed = 0
  let previous = 0
  let lastDraw = 0
  const small = window.matchMedia('(max-width: 650px)')
  function render() {
    if (!disposed && !lost && visible && !document.hidden) renderer.render(scene, camera)
  }
  function updateTheme() {
    const light = currentTheme() === 'light'
    ambient.color.set(light ? '#fff5e9' : '#e5edff')
    ambient.groundColor.set(light ? '#68718c' : '#495273')
    key.color.set(light ? '#fff4e4' : '#fff2df')
    fill.color.set(light ? '#bdcfff' : '#aebdff')
    groundMaterial.color.set(light ? '#293a61' : '#a9baff')
    host.dataset.theme = currentTheme()
    render()
  }
  const unsubscribeTheme = subscribeTheme(updateTheme)
  function draw(time: number) {
    if (!running) return
    frame = requestAnimationFrame(draw)
    const fps = small.matches ? (isRendering('hero') ? 20 : 24) : isRendering('hero') ? 24 : 30
    host.dataset.fps = String(fps)
    if (time - lastDraw < 1000 / fps) return
    lastDraw = time
    if (previous) elapsed += (time - previous) / 1000
    previous = time
    host.dataset.pose = character.update(elapsed)
    render()
  }
  function sync() {
    if (disposed || lost) return
    const next = moving && visible && !document.hidden
    host.dataset.rendering = !visible || document.hidden ? 'hidden' : next ? 'active' : 'paused'
    if (next === running) return
    running = next
    setRendering('companion', next)
    previous = 0
    lastDraw = 0
    if (next) frame = requestAnimationFrame(draw)
    else {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
  function resize() {
    if (disposed || lost) return
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small.matches ? 1.25 : 1.5))
    renderer.setSize(width, height, false)
    const halfHeight = 1.65,
      halfWidth = (halfHeight * width) / height
    camera.left = -halfWidth
    camera.right = halfWidth
    camera.top = halfHeight
    camera.bottom = -halfHeight
    camera.updateProjectionMatrix()
    render()
  }
  function contextLost(event: Event) {
    event.preventDefault()
    lost = true
    running = false
    cancelAnimationFrame(frame)
    setRendering('companion', false)
    host.dataset.rendering = 'unavailable'
    onFailure()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  document.addEventListener('visibilitychange', sync)
  canvas.addEventListener('webglcontextlost', contextLost)
  resize()
  updateTheme()
  host.dataset.rendering = 'paused'
  host.dataset.pose = 'static'
  return {
    setState(state) {
      const wasMoving = moving,
        wasVisible = visible
      moving = state.moving
      visible = state.visible
      if (!moving && wasMoving) {
        character.rest()
        host.dataset.pose = 'static'
      }
      if (visible && (!wasVisible || moving !== wasMoving)) render()
      sync()
    },
    wave() {
      if (!visible || disposed || lost || document.hidden) return
      character.greet(elapsed, moving)
      host.dataset.pose = 'wave'
      render()
    },
    dispose() {
      disposed = true
      running = false
      cancelAnimationFrame(frame)
      setRendering('companion', false)
      observer.disconnect()
      unsubscribeTheme()
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('webglcontextlost', contextLost)
      character.dispose()
      groundGeometry.dispose()
      groundMaterial.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
