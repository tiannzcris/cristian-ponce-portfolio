import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:4173'
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
})
const errors = []
const results = []
await mkdir('.qa/themes', { recursive: true })
async function open(options = {}, saved) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    ...options,
    ...(saved
      ? {
          storageState: {
            cookies: [],
            origins: [{ origin: base, localStorage: [{ name: 'cnp-theme', value: saved }] }],
          },
        }
      : {}),
  })
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.url().startsWith(base) && response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`)
  })
  return { page, context }
}
async function ready(page) {
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.locator('.hero-visual.scene-ready').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector('.hero-kicker')).opacity === '1',
  )
}
async function assertTheme(page, theme) {
  await page.waitForFunction(
    (expected) =>
      document.documentElement.dataset.theme === expected &&
      document.querySelector('.network-canvas').dataset.theme === expected,
    theme,
  )
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme),
    theme,
  )
  assert.equal(
    await page
      .getByRole('button', { name: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` })
      .count(),
    1,
  )
}
async function toggle(page, to) {
  await page.getByRole('button', { name: `Switch to ${to} theme` }).click()
  await assertTheme(page, to)
}
async function audit(page, name) {
  const report = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  assert.deepEqual(
    report.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
    [],
    name,
  )
}
try {
  for (const theme of ['light', 'dark']) {
    for (const width of [360, 1440]) {
      const { page, context } = await open({
        colorScheme: theme,
        viewport: { width, height: 1000 },
        isMobile: width === 360,
        hasTouch: width === 360,
      })
      await ready(page)
      await assertTheme(page, theme)
      assert.equal(
        await page.evaluate(() => localStorage.getItem('cnp-theme')),
        null,
        'Device preference is not saved as an explicit choice',
      )
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${theme} ${width}: no overflow`,
      )
      await page.locator('.technology-marquee').scrollIntoViewIfNeeded()
      await page.waitForFunction(
        () => document.querySelector('.marquee-track').getAnimations().length === 1,
      )
      assert.equal(await page.getByRole('list', { name: 'Technologies I work with' }).count(), 1)
      assert.equal(
        await page
          .getByRole('list', { name: 'Technologies I work with' })
          .getByRole('listitem')
          .count(),
        13,
      )
      const logoStatus = await page.evaluate(async () => {
        const names = [
          ...document.querySelectorAll('.technology-accessible-list .technology-logo'),
        ].map(
          (el) =>
            getComputedStyle(el)
              .getPropertyValue('--logo')
              .match(/url\(['"]?([^'"]+)/)[1],
        )
        return Promise.all(
          names.map(async (name) => {
            const response = await fetch(name)
            return response.status
          }),
        )
      })
      assert.ok(logoStatus.every((code) => code === 200))
      const pause = page.getByRole('button', { name: 'Pause technology marquee' })
      await pause.click()
      assert.equal(
        await page.locator('.marquee-track').evaluate((el) => el.getAnimations()[0].playState),
        'paused',
      )
      await page.getByRole('button', { name: 'Resume technology marquee' }).click()
      await page.mouse.move(0, 0)
      await page.evaluate(() => document.activeElement.blur())
      await page.waitForFunction(
        () => document.querySelector('.marquee-track').getAnimations()[0].playState === 'running',
      )
      await page.locator('.marquee-viewport').hover()
      assert.equal(
        await page.locator('.marquee-track').evaluate((el) => el.getAnimations()[0].playState),
        'paused',
      )
      await page.mouse.move(0, 0)
      await pause.focus()
      assert.equal(
        await page.locator('.marquee-track').evaluate((el) => el.getAnimations()[0].playState),
        'paused',
      )
      await page.evaluate(() => document.activeElement.blur())
      const canvas = await page.locator('.network-canvas canvas').elementHandle()
      await page.evaluate(() => scrollTo(0, 0))
      const alternate = theme === 'light' ? 'dark' : 'light'
      await toggle(page, alternate)
      assert.ok(
        await page.evaluate(
          (canvas) => canvas === document.querySelector('.network-canvas canvas'),
          canvas,
        ),
        'Theme changes reuse the canvas',
      )
      assert.equal(await page.locator('.network-canvas canvas').count(), 1)
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator('.hero-visual.scene-ready').waitFor()
      await assertTheme(page, alternate)
      assert.equal(await page.evaluate(() => localStorage.getItem('cnp-theme')), alternate)
      await page.emulateMedia({ colorScheme: theme })
      await assertTheme(page, alternate)
      await toggle(page, theme)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForFunction(
        () => document.querySelector('.marquee-track').getAnimations().length === 0,
      )
      assert.equal(
        await page.locator('.marquee-viewport').evaluate((el) => getComputedStyle(el).display),
        'none',
      )
      assert.equal(
        await page
          .getByRole('list', { name: 'Technologies I work with' })
          .evaluate((el) => getComputedStyle(el).flexWrap),
        'wrap',
      )
      assert.ok(await page.getByRole('button', { name: 'Pause technology marquee' }).isDisabled())
      await page.waitForFunction(
        () => document.querySelector('.network-canvas').dataset.rendering === 'paused',
      )
      await audit(page, `${theme} ${width} accessibility`)
      await page.evaluate(async () => {
        await Promise.all(
          [...document.images].map((image) => {
            image.loading = 'eager'
            return image.decode()
          }),
        )
      })
      await page.screenshot({ path: `.qa/themes/${theme}-${width}.png`, fullPage: true })
      await page.getByRole('button', { name: 'View TOPCIT · Level 2 certificate' }).click()
      await page
        .getByRole('dialog')
        .locator('img')
        .evaluate((img) => img.decode())
      await audit(page, `${theme} ${width} certificate dialog accessibility`)
      await page.screenshot({ path: `.qa/themes/${theme}-${width}-dialog.png` })
      await page.keyboard.press('Escape')
      assert.ok(
        await page
          .getByRole('button', { name: 'View TOPCIT · Level 2 certificate' })
          .evaluate((el) => el === document.activeElement),
      )
      if (width === 360) {
        await page.getByRole('button', { name: 'Open navigation' }).click()
        await toggle(page, alternate)
        assert.equal(
          await page
            .getByRole('button', { name: 'Close navigation' })
            .getAttribute('aria-expanded'),
          'true',
        )
        await page.getByRole('navigation').getByRole('link', { name: 'Skills' }).click()
        assert.equal(
          await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'),
          'false',
        )
      }
      results.push(
        `${theme} ${width}px: system preference, in-place 3D update, saved choice/reload, marquee controls/hover/focus, reduced motion, dialogs, axe accessibility`,
      )
      await context.close()
    }
  }

  const { page: system, context: systemContext } = await open({
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  await ready(system)
  const originalCanvas = await system.locator('.network-canvas canvas').elementHandle()
  const lightFrame = await system.locator('.network-canvas canvas').screenshot()
  await system.emulateMedia({ colorScheme: 'dark' })
  await assertTheme(system, 'dark')
  assert.equal(await system.evaluate(() => localStorage.getItem('cnp-theme')), null)
  const darkFrame = await system.locator('.network-canvas canvas').screenshot()
  assert.ok(!lightFrame.equals(darkFrame), 'The paused 3D scene repaints in the new palette')
  for (let i = 0; i < 10; i++) await toggle(system, i % 2 === 0 ? 'light' : 'dark')
  assert.ok(
    await system.evaluate(
      (canvas) => canvas === document.querySelector('.network-canvas canvas'),
      originalCanvas,
    ),
  )
  assert.equal(await system.locator('.network-canvas canvas').count(), 1)
  assert.equal(await system.locator('.network-canvas').getAttribute('data-rendering'), 'paused')
  await system.screenshot({ path: '.qa/themes/dark-desktop-hero.png' })
  await toggle(system, 'light')
  await system.screenshot({ path: '.qa/themes/light-desktop-hero.png' })
  await systemContext.close()
  results.push(
    'Live device preference followed without a saved choice; paused scene repaints; ten switches keep one canvas and no continuous rendering',
  )

  // The head script must select the theme while the React module is still blocked.
  for (const theme of ['light', 'dark']) {
    const { page, context } = await open(
      { colorScheme: theme === 'dark' ? 'light' : 'dark' },
      theme,
    )
    let release
    const gate = new Promise((resolve) => {
      release = resolve
    })
    await page.route('**/assets/*.js', async (route) => {
      await gate
      await route.continue()
    })
    await page.goto(base, { waitUntil: 'commit' })
    await page.waitForFunction(
      () => document.getElementById('root') && document.documentElement.dataset.theme,
    )
    assert.equal(await page.locator('#root').evaluate((el) => el.childElementCount), 0)
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme)
    assert.equal(
      await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor),
      theme === 'dark' ? 'rgb(10, 12, 18)' : 'rgb(247, 248, 252)',
    )
    release()
    await page.locator('.hero-visual.scene-ready').waitFor()
    await context.close()
  }
  results.push(
    'Startup: saved theme and correct canvas background applied before React loads in both palettes',
  )

  const { page: wide, context: wideContext } = await open({
    viewport: { width: 3840, height: 1200 },
    colorScheme: 'light',
  })
  await ready(wide)
  await wide.locator('.technology-marquee').scrollIntoViewIfNeeded()
  await wide.waitForFunction(
    () => document.querySelector('.marquee-group').getBoundingClientRect().width >= innerWidth,
  )
  const loop = await wide.locator('.marquee-track').evaluate((track) => {
    const animation = track.getAnimations()[0]
    animation.pause()
    const duration = animation.effect.getTiming().duration
    const group = track.firstElementChild
    const start = group.getBoundingClientRect().width
    const inspect = (time) => {
      animation.currentTime = time
      const boxes = [...track.querySelectorAll('.technology-item')]
        .map((el) => el.getBoundingClientRect())
        .filter((box) => box.right > 0 && box.left < innerWidth)
      return {
        first: boxes[0].left,
        last: boxes[boxes.length - 1].right,
        maxGap: Math.max(...boxes.slice(1).map((box, i) => box.left - boxes[i].right)),
      }
    }
    return {
      width: start,
      before: inspect(duration - 1),
      after: inspect(duration + 1),
      middle: inspect(duration * 0.5),
      animations: track.getAnimations().length,
    }
  })
  for (const frame of [loop.before, loop.after, loop.middle])
    assert.ok(
      frame.first <= 44 && frame.last >= 3840 - 44 && frame.maxGap <= 45,
      JSON.stringify(loop),
    )
  assert.ok(
    Math.abs(loop.before.first - loop.after.first) < 1,
    'Seamless position across animation wrap',
  )
  assert.equal(loop.animations, 1)
  await wide.screenshot({ path: '.qa/themes/marquee-3840.png' })
  results.push(
    '3840px marquee: full coverage, consistent gaps and <1px difference across loop boundary, one animation',
  )
  await wideContext.close()

  const { page: fallback, context: fallbackContext } = await open({
    reducedMotion: 'reduce',
    colorScheme: 'light',
  })
  await fallback.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return kind === 'webgl2' || kind === 'webgl' ? null : getContext.call(this, kind, ...args)
    }
    Object.defineProperty(Storage.prototype, 'setItem', {
      value() {
        throw new Error('Storage blocked')
      },
    })
    Object.defineProperty(Storage.prototype, 'getItem', {
      value() {
        throw new Error('Storage blocked')
      },
    })
  })
  await fallback.goto(base, { waitUntil: 'networkidle' })
  assert.equal(await fallback.locator('.hero-visual.scene-ready').count(), 0)
  for (const theme of ['light', 'dark']) {
    assert.equal(await fallback.evaluate(() => document.documentElement.dataset.theme), theme)
    assert.equal(
      await fallback.locator('.network-fallback').evaluate((el) => getComputedStyle(el).opacity),
      '1',
    )
    await fallback.screenshot({ path: `.qa/themes/fallback-${theme}.png` })
    await fallback
      .getByRole('button', { name: `Switch to ${theme === 'light' ? 'dark' : 'light'} theme` })
      .click()
  }
  await fallbackContext.close()
  results.push(
    'Blocked localStorage and unavailable WebGL: both themes and static illustration remain functional',
  )
  assert.deepEqual(errors, [], 'No browser exceptions, console errors, or broken local resources')
  await writeFile('.qa/themes/verification.json', JSON.stringify({ results, errors }, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}
