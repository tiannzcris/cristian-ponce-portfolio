import sharp from 'sharp'
import { mkdir, rename, access } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const publicImages = path.join(root, 'public/images')
const originals = path.join(root, 'assets/originals')
await mkdir(path.join(originals, 'certificates'), { recursive: true })
await mkdir(path.join(originals, 'projects'), { recursive: true })
const certificates = [
  ['866203952_1691749402591555_8313694872604414415_n.jpg', 'web-development-champion'],
  ['871017688_1142228098576805_6868662248075544614_n.jpg', 'image-editing-third-place'],
  ['858839172_3020808361621626_5897120912859495022_n.jpg', 'devcon-sui-completion'],
  ['858839172_1401957398675053_108402588353596018_n.jpg', 'cloud-computing-participation'],
  ['861843290_1440036214898004_8295058484538189910_n.jpg', 'animation-participation'],
  ['topcit-redacted.png', 'topcit-level-2-redacted'],
]
async function sourceFile(folder, file) {
  const retained = path.join(originals, folder, file)
  try {
    await access(retained)
    return retained
  } catch {
    /* First run: preserve the source. */
  }
  await rename(path.join(publicImages, folder, file), retained)
  return retained
}
for (const [file, name] of certificates) {
  const source = await sourceFile('certificates', file)
  await sharp(source)
    .webp({ quality: 92 })
    .toFile(path.join(publicImages, 'certificates', `${name}.webp`))
  await sharp(source)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(publicImages, 'certificates', `${name}-thumb.webp`))
}
for (const [file, name] of [
  ['E-LIKAS.png', 'e-likas'],
  ['server-disctionary.png', 'windows-server'],
  ['sui-code-camp-public.png', 'sui-code-camp'],
]) {
  const source = await sourceFile('projects', file)
  await sharp(source)
    .webp({ quality: 88 })
    .toFile(path.join(publicImages, 'projects', `${name}.webp`))
}
for (const width of [480, 800]) {
  // Resize/encode only: deliberately no sharpening, filtering, or added blur.
  await sharp(path.join(publicImages, 'portrait.jpg'))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(path.join(publicImages, `portrait-${width}.webp`))
}
const preview = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="glow"><stop stop-color="#334b85"/><stop offset="1" stop-color="#0a0c12"/></radialGradient></defs><rect width="1200" height="630" fill="#0a0c12"/><circle cx="1010" cy="310" r="310" fill="url(#glow)"/><g fill="none" stroke="#6f91d3" opacity=".5"><ellipse cx="1010" cy="310" rx="200" ry="82" transform="rotate(-35 1010 310)"/><ellipse cx="1010" cy="310" rx="200" ry="82" transform="rotate(60 1010 310)"/><circle cx="1010" cy="310" r="140"/><path d="m1010 170 121 210H889z m0 280 121-210H889z"/></g><text x="75" y="90" fill="#c5d3ff" font-family="Arial,sans-serif" font-size="37" font-weight="bold">cnp.</text><text x="75" y="180" fill="#a9b5cc" font-family="Arial,sans-serif" font-size="16" letter-spacing="3">CRISTIAN N. PONCE</text><g font-family="Arial,sans-serif" font-size="64" font-weight="bold"><text x="70" y="285" fill="#f1f3fa">Building ideas into</text><text x="70" y="366" fill="#bacbff">practical digital</text><text x="70" y="447" fill="#f1f3fa">experiences.</text></g><path d="M75 516H1125" stroke="#ffffff20"/><text x="75" y="562" fill="#a9b5cc" font-family="Arial,sans-serif" font-size="17">ASPIRING SOFTWARE DEVELOPER</text><text x="840" y="562" fill="#a9b5cc" font-family="Arial,sans-serif" font-size="16">WEB / MOBILE / DESKTOP</text></svg>`
await sharp(Buffer.from(preview)).png().toFile(path.join(root, 'public/social-preview.png'))
console.log(
  'Optimized project screenshots, responsive portrait, six readable certificates, thumbnails, and social preview.',
)
