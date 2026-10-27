import * as THREE from 'three'

export type NetworkController = { setPaused: (paused: boolean) => void; dispose: () => void }

export function createNetwork(host: HTMLElement, onFailure: () => void): NetworkController | null {
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

  const small = window.matchMedia('(max-width: 800px)').matches
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pointerDevice = window.matchMedia('(hover: hover) and (pointer: fine)')
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.6))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 40)
  camera.position.set(0, 0, 7.6)
  const sculpture = new THREE.Group()
  sculpture.rotation.set(0.17, 0.3, -0.16)
  scene.add(sculpture)
  const geometry = new THREE.IcosahedronGeometry(1.42, 1)
  const shell = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: 0x192f5c,
      metalness: 0.65,
      roughness: 0.34,
      transparent: true,
      opacity: 0.65,
      flatShading: true,
    }),
  )
  sculpture.add(shell)
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x6f96f0, transparent: true, opacity: 0.48 }),
  )
  sculpture.add(edges)

  const points = geometry.getAttribute('position')
  const unique = new Map<string, THREE.Vector3>()
  for (let i = 0; i < points.count; i++) {
    const vector = new THREE.Vector3().fromBufferAttribute(points, i)
    unique.set(`${vector.x.toFixed(3)},${vector.y.toFixed(3)},${vector.z.toFixed(3)}`, vector)
  }
  const nodeGeometry = new THREE.SphereGeometry(0.025, 8, 6)
  const nodes = new THREE.InstancedMesh(
    nodeGeometry,
    new THREE.MeshBasicMaterial({ color: 0xa6d6ff }),
    unique.size,
  )
  const matrix = new THREE.Matrix4()
  Array.from(unique.values()).forEach((position, i) => {
    matrix.makeTranslation(position.x, position.y, position.z)
    nodes.setMatrixAt(i, matrix)
  })
  sculpture.add(nodes)

  // Three orbital planes represent the connected web, mobile and desktop disciplines.
  const rings = new THREE.Group()
  const satellites: THREE.Mesh[] = []
  const colors = [0x96bbff, 0xa99af0, 0x85dde7]
  for (let i = 0; i < 3; i++) {
    const orbit = new THREE.Group()
    orbit.rotation.set(0.8 + i * 0.65, 0.25 + i * 0.5, i * 1.05)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.83 + i * 0.13, 0.006, 4, small ? 80 : 128),
      new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.58 }),
    )
    orbit.add(ring)
    const satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 8),
      new THREE.MeshBasicMaterial({ color: colors[i] }),
    )
    satellite.position.set(1.83 + i * 0.13, 0, 0)
    orbit.add(satellite)
    satellites.push(satellite)
    rings.add(orbit)
  }
  sculpture.add(rings)
  const coreGeometry = new THREE.OctahedronGeometry(0.65)
  const core = new THREE.LineSegments(
    new THREE.EdgesGeometry(coreGeometry),
    new THREE.LineBasicMaterial({ color: 0xc5ceff, transparent: true, opacity: 0.8 }),
  )
  coreGeometry.dispose()
  sculpture.add(core)
  scene.add(new THREE.AmbientLight(0x819bdb, 2))
  const blue = new THREE.DirectionalLight(0x779dff, 6)
  blue.position.set(-3, 3, 5)
  scene.add(blue)
  const lavender = new THREE.DirectionalLight(0xc0a3ff, 4)
  lavender.position.set(3, -2, 2)
  scene.add(lavender)

  const stars = new Float32Array((small ? 40 : 90) * 3)
  for (let i = 0; i < stars.length; i += 3) {
    // Deterministic placement keeps the first frame stable.
    stars[i] = Math.sin(i * 12.9898) * 3.9
    stars[i + 1] = Math.cos(i * 7.233) * 3
    stars[i + 2] = -1 - (i % 13) * 0.15
  }
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3))
  scene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0x9baecf, size: 0.013, transparent: true, opacity: 0.55 }),
    ),
  )

  let paused = motion.matches
  let visible = true
  let disposed = false
  let lost = false
  let running = false
  let previousTime = 0
  let elapsed = 0
  let pointerX = 0
  let pointerY = 0
  let lastDraw = 0
  function draw(time: number) {
    if (disposed || lost) return
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0
    previousTime = time
    if (small && time - lastDraw < 1000 / 30) return
    lastDraw = time
    elapsed += delta
    sculpture.rotation.y += (0.3 + pointerX * 0.18 + elapsed * 0.065 - sculpture.rotation.y) * 0.035
    sculpture.rotation.x += (0.17 + pointerY * 0.1 - sculpture.rotation.x) * 0.035
    rings.rotation.z = elapsed * 0.025
    satellites.forEach((satellite, i) => {
      const radius = 1.83 + i * 0.13
      const angle = elapsed * (0.16 + i * 0.03) + i * 2.1
      satellite.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    })
    renderer.render(scene, camera)
  }
  function sync() {
    if (disposed || lost) return
    const shouldRun = visible && !document.hidden && !paused
    if (shouldRun === running) return
    running = shouldRun
    host.dataset.rendering = shouldRun ? 'active' : 'paused'
    previousTime = 0
    renderer.setAnimationLoop(shouldRun ? draw : null)
  }
  function resize() {
    if (disposed || lost) return
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    renderer.render(scene, camera)
  }
  function move(event: PointerEvent) {
    if (!pointerDevice.matches || paused) return
    const bounds = host.getBoundingClientRect()
    pointerX = (event.clientX - bounds.left) / bounds.width - 0.5
    pointerY = (event.clientY - bounds.top) / bounds.height - 0.5
  }
  function leave() {
    pointerX = 0
    pointerY = 0
  }
  function contextLost(event: Event) {
    event.preventDefault()
    lost = true
    renderer.setAnimationLoop(null)
    host.dataset.rendering = 'unavailable'
    onFailure()
  }
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting
      sync()
    },
    { threshold: 0 },
  )
  const resizeObserver = new ResizeObserver(resize)
  observer.observe(host)
  resizeObserver.observe(host)
  document.addEventListener('visibilitychange', sync)
  host.addEventListener('pointermove', move)
  host.addEventListener('pointerleave', leave)
  canvas.addEventListener('webglcontextlost', contextLost)
  resize()
  draw(0)
  host.dataset.rendering = 'paused'
  sync()

  return {
    setPaused(value) {
      paused = value
      sync()
    },
    dispose() {
      disposed = true
      renderer.setAnimationLoop(null)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('webglcontextlost', contextLost)
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments ||
          object instanceof THREE.Points
        ) {
          geometries.add(object.geometry)
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material])
            materials.add(material)
        }
      })
      geometries.forEach((item) => item.dispose())
      materials.forEach((item) => item.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
