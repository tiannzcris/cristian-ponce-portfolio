import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'
import * as THREE from 'three'

await mkdir('.qa/companion', { recursive: true })
const source = await readFile('src/companion/proceduralCharacter.ts', 'utf8')
const moduleFile = path.resolve('.qa/companion/model-under-test.mjs')
await writeFile(
  moduleFile,
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText,
)
const { createProceduralCharacter } = await import(pathToFileURL(moduleFile).href)
const character = createProceduralCharacter()
const nodes = []
character.root.traverse((node) => {
  nodes.push(node)
})
const meshes = nodes.filter((node) => node instanceof THREE.Mesh)
for (const name of [
  'head',
  'torso',
  'left shoulder',
  'right shoulder',
  'left elbow',
  'right elbow',
  'left hip',
  'right hip',
  'left knee',
  'right knee',
])
  assert.ok(character.root.getObjectByName(name), `Independent joint: ${name}`)
const snapshot = () =>
  nodes.flatMap((node) => [
    ...node.position.toArray(),
    node.rotation.x,
    node.rotation.y,
    node.rotation.z,
    ...node.scale.toArray(),
  ])
character.update(1)
const start = snapshot()
character.update(1 + 8 / 3)
assert.ok(
  start.every((value, index) => Math.abs(value - snapshot()[index]) < 1e-6),
  'Base dance closes seamlessly',
)
const box = new THREE.Box3()
let minimum = Infinity,
  maximumFoot = -Infinity
for (let frame = 0; frame <= 20 * 30; frame++) {
  const time = frame / 30
  character.update(time)
  character.root.updateMatrixWorld(true)
  box.setFromObject(character.root)
  minimum = Math.min(minimum, box.min.y)
  for (const name of ['left ankle', 'right ankle']) {
    const footBox = new THREE.Box3().setFromObject(character.root.getObjectByName(name))
    maximumFoot = Math.max(maximumFoot, footBox.min.y)
  }
  for (const aspect of [156 / 188, 108 / 120]) {
    const camera = new THREE.OrthographicCamera(-1.65 * aspect, 1.65 * aspect, 1.65, -1.65, 0.1, 20)
    camera.position.set(0.5, 1.8, 7)
    camera.lookAt(0, 1.4, 0)
    camera.updateMatrixWorld(true)
    for (const mesh of meshes) {
      const positions = mesh.geometry.getAttribute('position')
      for (let index = 0; index < positions.count; index++) {
        const point = new THREE.Vector3()
          .fromBufferAttribute(positions, index)
          .applyMatrix4(mesh.matrixWorld)
          .project(camera)
        assert.ok(
          Math.abs(point.x) < 0.97 && Math.abs(point.y) < 0.97,
          `Mesh clipped at t=${time}, ${mesh.parent.name}: ${point.toArray()}`,
        )
      }
    }
  }
}
assert.ok(minimum > -0.025, `Feet stay above the floor within stylized tolerance: ${minimum}`)
assert.ok(maximumFoot < 0.1, `Steps stay near the floor: ${maximumFoot}`)
character.greet(21, true)
assert.equal(character.update(22), 'wave')
assert.equal(character.update(24), 'dance')
character.update(5.35)
assert.ok(character.root.getObjectByName('left eye').scale.y < 0.1, 'Blink closes eyes')
character.rest()
assert.equal(character.root.getObjectByName('left eye').scale.y, 1)
const materials = new Set(
  meshes.flatMap((mesh) => (Array.isArray(mesh.material) ? mesh.material : [mesh.material])),
)
const geometries = new Set(meshes.map((mesh) => mesh.geometry))
const disposed = { materials: 0, geometries: 0 }
materials.forEach((material) => material.addEventListener('dispose', () => disposed.materials++))
geometries.forEach((geometry) => geometry.addEventListener('dispose', () => disposed.geometries++))
character.dispose()
assert.equal(disposed.materials, materials.size)
assert.equal(disposed.geometries, geometries.size)
console.log(
  `Model checks pass: ${meshes.length} real meshes; ${materials.size} shared materials; ${geometries.size} geometries; independent joints, seamless dance, wave/blink, sampled desktop/mobile camera bounds, grounded steps, disposal.`,
)
console.log(`Foot extrema: ${minimum.toFixed(4)} to ${maximumFoot.toFixed(4)} units above ground.`)
