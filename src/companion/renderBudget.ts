type Surface = 'hero' | 'companion'
const active: Record<Surface, boolean> = { hero: false, companion: false }

export function setRendering(surface: Surface, rendering: boolean) {
  active[surface] = rendering
}

export function isRendering(surface: Surface) {
  return active[surface]
}
