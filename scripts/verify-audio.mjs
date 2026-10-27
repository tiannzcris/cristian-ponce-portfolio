import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const dev = process.env.PORTFOLIO_DEV_URL || 'http://127.0.0.1:5173'
const production = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:4173'
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
  args: ['--mute-audio'],
})
const errors = []
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto(dev, { waitUntil: 'networkidle' })
  await page.getByRole('group', { name: 'Background music', exact: true }).waitFor()
  assert.equal(
    await page.locator('audio').evaluate((audio) => audio.paused && !audio.autoplay),
    true,
    'No audio autoplay',
  )
  assert.equal(await page.locator('audio').evaluate((audio) => audio.volume), 0.25)
  await page.getByRole('button', { name: 'Play background music', exact: true }).click()
  await page.waitForFunction(
    () =>
      !document.querySelector('audio').paused && document.querySelector('audio').currentTime > 0,
  )
  await page.getByRole('button', { name: 'Pause background music', exact: true }).click()
  assert.equal(await page.locator('audio').evaluate((audio) => audio.paused), true)
  await page.getByRole('slider', { name: 'Background music volume' }).fill('0.55')
  assert.equal(await page.locator('audio').evaluate((audio) => audio.volume), 0.55)
  await page.getByRole('button', { name: 'Mute background music', exact: true }).click()
  assert.equal(await page.locator('audio').evaluate((audio) => audio.muted), true)
  await page.getByRole('button', { name: 'Unmute background music', exact: true }).click()
  assert.equal(await page.locator('audio').evaluate((audio) => audio.muted), false)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Play background music', exact: true }).waitFor()
  assert.equal(
    await page.locator('audio').evaluate((audio) => audio.paused),
    true,
    'Reload never restarts playback',
  )
  await context.close()
  const missingContext = await browser.newContext()
  const missing = await missingContext.newPage()
  missing.on('pageerror', (error) => errors.push(error.message))
  await missing.route('**/audio/background.mp3', (route) =>
    route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' }),
  )
  await missing.goto(dev, { waitUntil: 'networkidle' })
  assert.equal(await missing.locator('.music-player').count(), 0, 'Missing track hides controls')
  assert.equal(await missing.locator('audio').count(), 0)
  await missingContext.close()
  const productionContext = await browser.newContext()
  const prod = await productionContext.newPage()
  const requests = []
  prod.on('request', (request) => {
    if (request.url().includes('/audio/')) requests.push(request.url())
  })
  await prod.goto(production, { waitUntil: 'networkidle' })
  assert.equal(await prod.locator('.music-player,audio').count(), 0)
  assert.deepEqual(requests, [])
  await productionContext.close()
  let exists = true
  try {
    await access('dist/audio/background.mp3')
  } catch {
    exists = false
  }
  assert.equal(exists, false, 'Private MP3 excluded from dist')
  assert.equal(
    execFileSync('git', ['ls-files', 'public/audio/background.mp3'], { encoding: 'utf8' }).trim(),
    '',
    'Track is not Git-tracked',
  )
  for (const file of ['.gitignore', '.vercelignore'])
    assert.ok((await readFile(file, 'utf8')).split(/\r?\n/).includes('public/audio/background.mp3'))
  assert.deepEqual(errors, [])
  console.log(
    'Audio checks pass: DEV-only local MP3, no autoplay/reload playback, explicit play/pause, mute, volume, graceful missing-track handling, production hidden/no requests, Git and Vercel exclusions, no MP3 in dist, no page errors.',
  )
} finally {
  await browser.close()
}
