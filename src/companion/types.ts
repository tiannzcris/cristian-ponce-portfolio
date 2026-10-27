import type { Group } from 'three'

/** A future GLB adapter implements this interface; controls and renderer stay unchanged. */
export interface CompanionCharacter {
  root: Group
  update: (seconds: number) => 'dance' | 'wave'
  greet: (seconds: number, animated: boolean) => void
  rest: () => void
  dispose: () => void
}

export interface CompanionController {
  setState: (state: { moving: boolean; visible: boolean }) => void
  wave: () => void
  dispose: () => void
}
