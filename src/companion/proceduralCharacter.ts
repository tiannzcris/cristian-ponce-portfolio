import * as THREE from 'three'
import type { CompanionCharacter } from './types'

/** Original mesh character. All dimensions, facial details and joint animation live here. */
export function createProceduralCharacter(): CompanionCharacter {
  const root = new THREE.Group()
  root.name = 'Cristian chibi'
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const geometry = <T extends THREE.BufferGeometry>(value: T) => {
    geometries.add(value)
    return value
  }
  const material = (color: string, roughness = 0.72) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness })
    materials.add(value)
    return value
  }
  const skin = material('#c58b64')
  const noseSkin = material('#cc946e')
  const blush = material('#bf7c64')
  const suit = material('#20232d')
  const lapel = material('#353946')
  const hair = material('#181923')
  const hairLight = material('#272936')
  const white = material('#fff9ed')
  const ink = material('#191620', 0.45)
  const iris = material('#483329', 0.4)
  const shoeMaterial = material('#171a23', 0.48)
  const sphere = geometry(new THREE.SphereGeometry(1, 20, 14))
  const smallSphere = geometry(new THREE.SphereGeometry(1, 12, 8))
  const capsule = geometry(new THREE.CapsuleGeometry(1, 1, 4, 12))

  function ellipsoid(
    parent: THREE.Object3D,
    mat: THREE.Material,
    position: [number, number, number],
    scale: [number, number, number],
    detail = false,
  ) {
    const mesh = new THREE.Mesh(detail ? smallSphere : sphere, mat)
    mesh.position.set(...position)
    mesh.scale.set(...scale)
    parent.add(mesh)
    return mesh
  }
  function joint(parent: THREE.Object3D, name: string, position: [number, number, number]) {
    const group = new THREE.Group()
    group.name = name
    group.position.set(...position)
    parent.add(group)
    return group
  }
  function panel(parent: THREE.Object3D, mat: THREE.Material, points: number[][], z: number) {
    const shape = new THREE.Shape()
    points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)))
    shape.closePath()
    const mesh = new THREE.Mesh(
      geometry(new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false })),
      mat,
    )
    mesh.position.z = z
    parent.add(mesh)
    return mesh
  }
  function curve(
    parent: THREE.Object3D,
    points: THREE.Vector3[],
    radius: number,
    mat: THREE.Material,
  ) {
    const path = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2])
    const mesh = new THREE.Mesh(geometry(new THREE.TubeGeometry(path, 12, radius, 5, false)), mat)
    parent.add(mesh)
    return mesh
  }

  const torso = joint(root, 'torso', [0, 0.78, 0])
  const jacket = new THREE.Mesh(capsule, suit)
  jacket.scale.set(0.31, 0.29, 0.205)
  jacket.position.y = 0.32
  torso.add(jacket)
  ellipsoid(torso, skin, [0, 0.72, 0], [0.12, 0.12, 0.12])
  panel(
    torso,
    white,
    [
      [-0.14, 0.65],
      [0.14, 0.65],
      [0.105, 0.16],
      [-0.105, 0.16],
    ],
    0.195,
  )
  panel(
    torso,
    lapel,
    [
      [-0.24, 0.65],
      [-0.12, 0.7],
      [-0.01, 0.32],
      [-0.24, 0.49],
      [-0.18, 0.54],
    ],
    0.215,
  )
  panel(
    torso,
    lapel,
    [
      [0.24, 0.65],
      [0.12, 0.7],
      [0.01, 0.32],
      [0.24, 0.49],
      [0.18, 0.54],
    ],
    0.215,
  )
  panel(
    torso,
    white,
    [
      [-0.14, 0.69],
      [0, 0.64],
      [-0.065, 0.54],
    ],
    0.245,
  )
  panel(
    torso,
    white,
    [
      [0.14, 0.69],
      [0, 0.64],
      [0.065, 0.54],
    ],
    0.245,
  )
  panel(
    torso,
    ink,
    [
      [-0.035, 0.63],
      [0.035, 0.63],
      [0.045, 0.58],
      [0, 0.54],
      [-0.045, 0.58],
    ],
    0.27,
  )
  panel(
    torso,
    ink,
    [
      [-0.025, 0.55],
      [0.025, 0.55],
      [0.045, 0.3],
      [0, 0.25],
      [-0.045, 0.3],
    ],
    0.27,
  )
  ellipsoid(torso, lapel, [0.025, 0.12, 0.214], [0.018, 0.018, 0.009], true)
  ellipsoid(torso, lapel, [0.025, 0.025, 0.2], [0.018, 0.018, 0.009], true)

  const head = joint(torso, 'head', [0, 0.77, 0])
  ellipsoid(head, skin, [0, 0.4, 0], [0.615, 0.635, 0.54])
  for (const side of [-1, 1]) {
    ellipsoid(head, skin, [side * 0.6, 0.4, -0.005], [0.095, 0.145, 0.095])
    ellipsoid(head, blush, [side * 0.65, 0.4, 0.045], [0.025, 0.075, 0.04], true)
    ellipsoid(head, blush, [side * 0.32, 0.26, 0.452], [0.075, 0.033, 0.012], true)
  }
  const eyes: THREE.Group[] = []
  for (const side of [-1, 1]) {
    const eye = joint(head, side < 0 ? 'left eye' : 'right eye', [side * 0.205, 0.425, 0.495])
    ellipsoid(eye, white, [0, 0, 0], [0.126, 0.151, 0.046])
    ellipsoid(eye, iris, [side * -0.008, -0.004, 0.039], [0.077, 0.112, 0.022])
    ellipsoid(eye, ink, [side * -0.008, 0, 0.057], [0.049, 0.083, 0.012])
    ellipsoid(eye, white, [-0.025, 0.045, 0.068], [0.025, 0.032, 0.009], true)
    ellipsoid(eye, white, [0.022, -0.035, 0.07], [0.011, 0.014, 0.005], true)
    eyes.push(eye)
    const x = side * 0.205
    curve(
      head,
      [
        new THREE.Vector3(x - 0.102, 0.624, 0.46),
        new THREE.Vector3(x, 0.665, 0.475),
        new THREE.Vector3(x + 0.102, 0.635, 0.46),
      ],
      0.017,
      hair,
    )
  }
  ellipsoid(head, noseSkin, [0, 0.285, 0.536], [0.048, 0.054, 0.045], true)
  curve(
    head,
    [
      new THREE.Vector3(-0.115, 0.174, 0.488),
      new THREE.Vector3(0, 0.086, 0.523),
      new THREE.Vector3(0.115, 0.174, 0.488),
    ],
    0.013,
    ink,
  )

  const hairCap = new THREE.Mesh(
    geometry(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, 1.62)),
    hair,
  )
  hairCap.position.set(0, 0.45, -0.045)
  hairCap.scale.set(0.635, 0.63, 0.565)
  head.add(hairCap)
  const fringe = [
    [-0.48, 0.7, 0.3, 0.15, 0.24, -0.65],
    [-0.33, 0.83, 0.43, 0.19, 0.27, -0.48],
    [-0.1, 0.87, 0.49, 0.19, 0.26, -0.35],
    [0.12, 0.88, 0.48, 0.17, 0.23, -0.3],
    [0.32, 0.8, 0.41, 0.17, 0.23, 0.3],
    [0.49, 0.68, 0.27, 0.13, 0.21, 0.55],
  ]
  fringe.forEach(([x, y, z, sx, sy, rotation], i) => {
    const lock = ellipsoid(head, i === 2 ? hairLight : hair, [x, y, z], [sx, sy, 0.105])
    lock.rotation.z = rotation
  })
  const tuftA = ellipsoid(head, hair, [-0.2, 1.045, -0.035], [0.16, 0.21, 0.16])
  tuftA.rotation.z = -0.48
  const tuftB = ellipsoid(head, hairLight, [0.045, 1.045, -0.08], [0.14, 0.18, 0.15])
  tuftB.rotation.z = 0.5

  function arm(side: number) {
    const shoulder = joint(torso, side < 0 ? 'left shoulder' : 'right shoulder', [
      side * 0.34,
      0.59,
      0,
    ])
    ellipsoid(shoulder, suit, [0, -0.13, 0], [0.12, 0.21, 0.13])
    const elbow = joint(shoulder, side < 0 ? 'left elbow' : 'right elbow', [0, -0.285, 0])
    ellipsoid(elbow, suit, [0, -0.105, 0], [0.105, 0.17, 0.115])
    ellipsoid(elbow, white, [0, -0.235, 0.005], [0.105, 0.04, 0.105], true)
    ellipsoid(elbow, skin, [0, -0.31, 0.015], [0.112, 0.12, 0.1])
    ellipsoid(elbow, skin, [side * -0.07, -0.285, 0.08], [0.046, 0.065, 0.055], true)
    return { shoulder, elbow }
  }
  function leg(side: number) {
    const hip = joint(root, side < 0 ? 'left hip' : 'right hip', [side * 0.175, 0.76, 0])
    ellipsoid(hip, suit, [0, -0.14, 0], [0.135, 0.23, 0.15])
    const knee = joint(hip, side < 0 ? 'left knee' : 'right knee', [0, -0.31, 0])
    ellipsoid(knee, suit, [0, -0.135, 0], [0.12, 0.205, 0.135])
    const ankle = joint(knee, side < 0 ? 'left ankle' : 'right ankle', [0, -0.3, 0])
    ellipsoid(ankle, shoeMaterial, [0, -0.055, 0.065], [0.15, 0.095, 0.225])
    return { hip, knee, ankle }
  }
  const leftArm = arm(-1),
    rightArm = arm(1)
  const legs = [leg(-1), leg(1)]
  let specialStart = -Infinity
  const smooth = (value: number) => {
    const t = THREE.MathUtils.clamp(value, 0, 1)
    return t * t * (3 - 2 * t)
  }

  function pose(seconds: number, staticGreeting = false): 'dance' | 'wave' {
    const phase = seconds * Math.PI * 0.75 // A complete, seamless 8/3-second dance cycle.
    const sway = Math.sin(phase)
    root.position.set(0.045 * sway, 0.012 * (1 - Math.cos(phase * 2)), 0)
    root.rotation.set(0, 0.085 * sway, 0.028 * sway)
    torso.rotation.set(0.025 * Math.sin(phase * 2), 0.045 * sway, -0.025 * sway)
    head.rotation.set(0.025 * Math.sin(phase + 1), -0.07 * sway, 0.04 * Math.sin(phase + 0.6))
    leftArm.shoulder.rotation.set(0.18 * Math.cos(phase), 0, -0.2 - 0.055 * sway)
    rightArm.shoulder.rotation.set(-0.18 * Math.cos(phase), 0, 0.2 - 0.055 * sway)
    leftArm.elbow.rotation.set(-0.08, 0, -0.04)
    rightArm.elbow.rotation.set(-0.08, 0, 0.04)
    legs.forEach((limb, index) => {
      const step = Math.sin(phase + index * Math.PI)
      limb.hip.rotation.set(0.16 * step, index === 0 ? -0.06 : 0.06, 0)
      limb.knee.rotation.x = -0.08 - 0.14 * Math.max(0, step)
      limb.ankle.rotation.x = -limb.hip.rotation.x - limb.knee.rotation.x
    })
    const blinkTime = seconds % 5.7
    const blink =
      blinkTime > 5.24 && blinkTime < 5.46
        ? Math.sin(((blinkTime - 5.24) / 0.22) * Math.PI) ** 2
        : 0
    eyes.forEach((eye) => {
      eye.scale.y = 1 - 0.94 * blink
    })
    const occasional = (seconds % 18) - 13
    const special = seconds - specialStart
    const greeting =
      special >= 0 && special < 2.8
        ? special
        : occasional >= 0 && occasional < 2.8
          ? occasional
          : -1
    const weight = staticGreeting
      ? 1
      : greeting >= 0
        ? smooth(greeting / 0.45) * smooth((2.8 - greeting) / 0.45)
        : 0
    if (weight > 0) {
      rightArm.shoulder.rotation.x *= 1 - weight
      rightArm.shoulder.rotation.z = THREE.MathUtils.lerp(rightArm.shoulder.rotation.z, 2.5, weight)
      rightArm.elbow.rotation.z = THREE.MathUtils.lerp(
        0.04,
        -0.52 + 0.2 * Math.sin(seconds * 13),
        weight,
      )
      head.rotation.z -= 0.055 * weight
    }
    return weight > 0.05 ? 'wave' : 'dance'
  }
  function rest() {
    specialStart = -Infinity
    pose(0)
    root.position.set(0, 0, 0)
    root.rotation.set(0, 0, 0)
    torso.rotation.set(0, 0, 0)
    head.rotation.set(0, 0, 0)
    eyes.forEach((eye) => {
      eye.scale.y = 1
    })
    legs.forEach((limb) => {
      limb.hip.rotation.x = 0
      limb.knee.rotation.x = 0
      limb.ankle.rotation.x = 0
    })
  }
  rest()
  return {
    root,
    update: (seconds) => pose(seconds),
    greet(seconds, animated) {
      if (animated) specialStart = seconds
      else {
        rest()
        pose(0, true)
      }
    },
    rest,
    dispose() {
      geometries.forEach((value) => value.dispose())
      materials.forEach((value) => value.dispose())
    },
  }
}
