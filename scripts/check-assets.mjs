import { readdir, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import path from 'node:path'

async function files(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await files(file)))
    else result.push(file)
  }
  return result
}
const publicFiles = await files('public')
const publicSet = new Set(
  publicFiles.map((file) => `/${file.replaceAll('\\', '/').replace(/^public\//, '')}`),
)
const content = await readFile('src/content.ts', 'utf8')
for (const match of content.matchAll(/['"](\/images\/[^'"]+)['"]/g))
  assert.ok(publicSet.has(match[1]), `Missing ${match[1]}`)
for (const file of [...publicFiles, ...(await files('dist'))]) {
  assert.ok(!/860208548|topcit-original|\.private/.test(file), `Private file exposed: ${file}`)
}
let original
try {
  original = await readFile('.private/topcit-original.jpg')
} catch {
  /* Private originals are deliberately absent from clean clones. */
}
if (original) {
  const fingerprint = createHash('sha256').update(original).digest('hex')
  for (const file of publicFiles)
    assert.notEqual(
      createHash('sha256')
        .update(await readFile(file))
        .digest('hex'),
      fingerprint,
      'Unredacted TOPCIT original found in public',
    )
}
const ignored = await readFile('.gitignore', 'utf8')
assert.ok(ignored.split(/\r?\n/).includes('.private/'))
console.log(
  `Content asset references pass; ${publicFiles.length} public files checked; private original excluded from public/build and ignored by Git.`,
)
