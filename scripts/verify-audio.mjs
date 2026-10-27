import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:4173'
const channel = process.env.PLAYWRIGHT_CHANNEL || 'chrome'
const errors = [],
  results = []
const storageKey = 'cnp-music-preferences'
await mkdir('.qa/audio', { recursive: true })
assert.deepEqual(
  await readFile('dist/audio/background.mp3'),
  await readFile('public/audio/background.mp3'),
)
assert.equal(
  spawnSync('git', ['check-ignore', '--no-index', '-q', 'public/audio/background.mp3']).status,
  1,
  'MP3 is eligible for Git',
)
assert.ok(
  !(await readFile('.vercelignore', 'utf8')).split(/\r?\n/).includes('public/audio/background.mp3'),
)

async function open(browser, options = {}, saved, expectedMediaError = false) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    ...options,
  })
  await context.addInitScript(
    ({ saved, storageKey }) => {
      if (saved && !localStorage.getItem(storageKey))
        localStorage.setItem(storageKey, JSON.stringify(saved))
      window.testMusicPlayCalls = 0
      window.testMusicActivationAtPlay = []
      window.testMusicRejections = []
      const play = HTMLMediaElement.prototype.play
      HTMLMediaElement.prototype.play = function (...args) {
        if (this.tagName === 'AUDIO') {
          window.testMusicPlayCalls++
          window.testMusicActivationAtPlay.push(navigator.userActivation.hasBeenActive)
        }
        return play.apply(this, args).catch((error) => {
          window.testMusicRejections.push(error.name)
          throw error
        })
      }
    },
    { saved, storageKey },
  )
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (!expectedMediaError && message.type() === 'error') errors.push(message.text())
  })
  return { context, page }
}
async function playing(page) {
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio')
    return audio && !audio.paused && audio.currentTime > 0
  })
  await page.getByRole('button', { name: 'Pause music', exact: true }).waitFor()
}
async function blocked(page) {
  await page
    .getByText('Autoplay was blocked. Press Play music to listen.', { exact: true })
    .waitFor()
  assert.ok(await page.getByRole('button', { name: 'Play music', exact: true }).isEnabled())
  assert.equal(await page.getByRole('button', { name: 'Pause music', exact: true }).count(), 0)
  assert.equal(await page.locator('audio').evaluate((audio) => audio.paused), true)
}
async function noLayoutOverlap(page) {
  assert.ok(
    await page.evaluate(() => {
      const player = document.querySelector('.music-player')
      const a = player.getBoundingClientRect()
      const b = document.querySelector('.companion-dock').getBoundingClientRect()
      return (
        getComputedStyle(player).position === 'static' &&
        document.documentElement.scrollWidth <= innerWidth &&
        (a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom)
      )
    }),
    'Controls stay in normal flow without overflow or companion overlap',
  )
}

// Browser policy flags are confined to QA. The deployed site never overrides autoplay policy.
const browser = await chromium.launch({
  channel,
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=user-gesture-required'],
})
try {
  for (const theme of ['light', 'dark'])
    for (const width of [360, 1440]) {
      const { context, page } = await open(browser, {
        colorScheme: theme,
        viewport: { width, height: width === 360 ? 844 : 1000 },
        hasTouch: width === 360,
        isMobile: width === 360,
      })
      await page.goto(base, { waitUntil: 'networkidle' })
      await blocked(page)
      assert.equal(await page.locator('audio').count(), 1)
      assert.equal(
        await page
          .locator('audio')
          .evaluate(
            (audio) =>
              audio.loop &&
              !audio.muted &&
              audio.volume === 0.25 &&
              audio.src.endsWith('/audio/background.mp3'),
          ),
        true,
      )
      assert.equal(await page.evaluate(() => window.testMusicPlayCalls), 1)
      assert.deepEqual(await page.evaluate(() => window.testMusicRejections), ['NotAllowedError'])
      await noLayoutOverlap(page)
      await page
        .locator('.music-widget')
        .screenshot({ path: `.qa/audio/${theme}-${width}-blocked.png` })
      await page.screenshot({ path: `.qa/audio/${theme}-${width}-page.png` })

      const alternate = theme === 'light' ? 'dark' : 'light'
      await page.getByRole('button', { name: `Switch to ${alternate} theme` }).click()
      await page.evaluate(() =>
        scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
      )
      await page.getByRole('button', { name: 'Wave with Cristian’s companion' }).click()
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      assert.equal(
        await page.evaluate(() => window.testMusicPlayCalls),
        1,
        'Unrelated clicks, scrolling, and themes do not retry autoplay',
      )
      await blocked(page)
      const play = page.getByRole('button', { name: 'Play music', exact: true })
      await play.focus()
      await page.keyboard.press('Enter')
      await playing(page)
      assert.equal(await page.evaluate(() => window.testMusicPlayCalls), 2)
      const audioHandle = await page.locator('audio').elementHandle()
      const time = await page.locator('audio').evaluate((audio) => audio.currentTime)
      await page.getByRole('button', { name: `Switch to ${theme} theme` }).click()
      await page.evaluate(() =>
        scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
      )
      await page.waitForTimeout(180)
      assert.ok(
        await page.evaluate(
          (element) => element === document.querySelector('audio') && !element.paused,
          audioHandle,
        ),
      )
      assert.ok(
        (await page.locator('audio').evaluate((audio) => audio.currentTime)) > time,
        'Playback continues while scrolling/changing theme',
      )

      const volume = page.getByRole('slider', { name: 'Background music volume' })
      await volume.fill('0.55')
      await volume.focus()
      await page.keyboard.press('ArrowRight')
      await page.waitForFunction(() => document.querySelector('audio').volume === 0.6)
      await page.getByRole('button', { name: 'Mute music', exact: true }).click()
      await page.getByRole('button', { name: 'Unmute music', exact: true }).waitFor()
      assert.equal(await page.locator('audio').evaluate((audio) => audio.muted), true)
      await page.getByRole('button', { name: 'Unmute music', exact: true }).click()
      assert.equal(await page.locator('audio').evaluate((audio) => audio.muted), false)
      if (theme === 'light' && width === 1440) {
        await page.locator('audio').evaluate((audio) => (audio.currentTime = audio.duration - 0.15))
        await page.waitForFunction(
          () =>
            document.querySelector('audio').currentTime < 1 &&
            !document.querySelector('audio').paused,
        )
        assert.equal(
          await page.evaluate(() => window.testMusicPlayCalls),
          2,
          'Native loop needs no extra play call',
        )
      }
      await page.getByRole('button', { name: 'Pause music', exact: true }).click()
      const pausedTime = await page.locator('audio').evaluate((audio) => audio.currentTime)
      await page.getByRole('button', { name: `Switch to ${alternate} theme` }).click()
      await page.waitForTimeout(180)
      assert.equal(await page.locator('audio').evaluate((audio) => audio.currentTime), pausedTime)
      assert.equal(
        await page.evaluate(() => window.testMusicPlayCalls),
        2,
        'Manual pause never retries',
      )
      await page.getByRole('button', { name: 'Mute music', exact: true }).click()
      await page.waitForFunction(
        (key) =>
          JSON.parse(localStorage.getItem(key)).muted &&
          JSON.parse(localStorage.getItem(key)).pausedByUser,
        storageKey,
      )
      await page.reload({ waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Play music', exact: true }).waitFor()
      assert.equal(
        await page
          .locator('audio')
          .evaluate((audio) => audio.paused && audio.muted && audio.volume === 0.6),
        true,
        'Mute, volume, and manual pause survive reload',
      )
      assert.equal(
        await page.evaluate(() => window.testMusicPlayCalls),
        0,
        'Saved manual pause suppresses startup autoplay',
      )
      await page.getByRole('button', { name: 'Play music', exact: true }).click()
      await playing(page)
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      assert.deepEqual(
        axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        [],
      )
      results.push(
        `${theme} ${width}px: one blocked startup attempt; explicit keyboard/native playback; loop; no unrelated-click retry; theme/scroll stability; pause; mute/volume keyboard controls; saved preferences/pause; no overlap; axe checks.`,
      )
      await context.close()
    }

  const { context, page } = await open(browser, {}, undefined, true)
  await page.route('**/audio/background.mp3', (route) =>
    route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' }),
  )
  await page.goto(base, { waitUntil: 'networkidle' })
  await page
    .getByText('Music is unavailable. The audio file could not be loaded.', { exact: true })
    .waitFor()
  assert.equal(await page.getByRole('button', { name: 'Pause music', exact: true }).count(), 0)
  assert.equal(await page.locator('audio').count(), 1)
  await page.unroute('**/audio/background.mp3')
  await page.getByRole('button', { name: 'Play music', exact: true }).click()
  await playing(page)
  results.push(
    'Missing-file media error is visible and recoverable by explicit Play after the file becomes available; one audio element; no unhandled rejection.',
  )
  await context.close()
} finally {
  await browser.close()
}

const allowed = await chromium.launch({
  channel,
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'],
})
try {
  for (const muted of [false, true]) {
    const { context, page } = await open(allowed, {}, { volume: 0.4, muted, pausedByUser: false })
    // Playing media can keep a range response open; wait for playback rather than network idle.
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await playing(page)
    assert.equal(await page.evaluate(() => window.testMusicPlayCalls), 1)
    assert.deepEqual(await page.evaluate(() => window.testMusicActivationAtPlay), [false])
    assert.equal(await page.locator('audio').evaluate((audio) => audio.volume), 0.4)
    assert.equal(await page.locator('audio').evaluate((audio) => audio.muted), muted)
    results.push(
      `Autoplay-permitted Chrome policy: native playback starts once without interaction, restoring volume 40% and muted=${muted}.`,
    )
    await context.close()
  }
} finally {
  await allowed.close()
}
assert.deepEqual(errors, [], 'No unexpected browser errors')
await writeFile('.qa/audio/verification.json', JSON.stringify({ results, errors }, null, 2))
console.log(results.join('\n'))
