import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:4173'
await mkdir('.qa/companion', { recursive: true })
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
  args: ['--mute-audio'],
})
const errors = [],
  results = []
async function assertDockClear(page) {
  await page.waitForFunction(() => {
    const dock = document.querySelector('.companion-dock')
    if (dock.hidden) return true
    const box = dock.getBoundingClientRect()
    return [...document.querySelectorAll('a[href],button,input,select,textarea,summary')]
      .filter(
        (target) =>
          !dock.contains(target) && target.getClientRects().length && !target.closest('[hidden]'),
      )
      .map((target) => target.getBoundingClientRect())
      .filter((other) => other.width && other.height && other.bottom > 0 && other.top < innerHeight)
      .every(
        (other) =>
          box.right <= other.left ||
          box.left >= other.right ||
          box.bottom <= other.top ||
          box.top >= other.bottom,
      )
  })
}
try {
  for (const theme of ['light', 'dark'])
    for (const width of [360, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme: theme,
        isMobile: width === 360,
        hasTouch: width === 360,
      })
      await context.addInitScript(() => {
        // Count real WebGL draws for each canvas; a transparent screenshot includes the moving hero behind it.
        for (const method of ['drawElements', 'drawArrays']) {
          const original = WebGL2RenderingContext.prototype[method]
          WebGL2RenderingContext.prototype[method] = function (...args) {
            this.canvas.dataset.testDraws = String(Number(this.canvas.dataset.testDraws || 0) + 1)
            return original.apply(this, args)
          }
        }
      })
      const page = await context.newPage()
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      const audioRequests = []
      page.on('request', (request) => {
        if (request.url().includes('/audio/')) audioRequests.push(request.url())
      })
      await page.goto(base, { waitUntil: 'networkidle' })
      await page.locator('.companion-ready').waitFor()
      const host = page.locator('.companion-canvas'),
        canvas = page.locator('.companion-canvas canvas')
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'active',
      )
      assert.equal(await canvas.count(), 1)
      await assertDockClear(page)
      assert.equal(
        await page.locator('audio').count(),
        0,
        'Production has no local-test audio element',
      )
      assert.deepEqual(audioRequests, [], 'Production makes no test track request')
      const first = await canvas.screenshot()
      await page.waitForTimeout(200)
      assert.ok(!first.equals(await canvas.screenshot()), 'Dance starts automatically')
      const size = await page.locator('.companion-stage').boundingBox()
      assert.equal(size.height, width === 360 ? 120 : 188)
      assert.equal(
        await page.locator('.companion-dock').evaluate((el) => getComputedStyle(el).pointerEvents),
        'none',
      )
      await page.getByRole('button', { name: 'Wave with Cristian’s companion' }).click()
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.pose === 'wave',
      )
      await page.waitForTimeout(650)
      await page.screenshot({ path: `.qa/companion/${theme}-${width}-wave.png` })
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.pose === 'dance',
      )
      await page.getByRole('button', { name: 'Wave with Cristian’s companion' }).focus()
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.pose === 'wave',
      )
      await page.getByRole('button', { name: 'Pause companion animation' }).click()
      assert.equal(await host.getAttribute('data-rendering'), 'paused')
      const paused = await canvas.getAttribute('data-test-draws')
      await page.waitForTimeout(180)
      assert.equal(
        await canvas.getAttribute('data-test-draws'),
        paused,
        'Paused character issues no WebGL draws',
      )
      await page.getByRole('button', { name: 'Hide companion', exact: true }).click()
      assert.equal(await host.getAttribute('data-rendering'), 'hidden')
      assert.equal(
        await page.getByRole('button', { name: 'Wave with Cristian’s companion' }).count(),
        0,
      )
      await page.getByRole('button', { name: 'Restore companion' }).click()
      assert.equal(await host.getAttribute('data-rendering'), 'paused')
      await page.getByRole('button', { name: 'Resume companion animation' }).click()
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'active',
      )
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      assert.equal(await host.getAttribute('data-rendering'), 'hidden')
      await page.evaluate(() => {
        delete document.hidden
        document.dispatchEvent(new Event('visibilitychange'))
      })
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'active',
      )
      await page.getByRole('button', { name: 'View TOPCIT · Level 2 certificate' }).click()
      assert.ok(await page.locator('.companion-dock').isHidden())
      assert.equal(await host.getAttribute('data-rendering'), 'hidden')
      await page.keyboard.press('Escape')
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await page.locator('.companion-dock').waitFor({ state: 'visible' })
      if (width === 360) {
        await page.getByRole('button', { name: 'Open navigation' }).click()
        assert.ok(await page.locator('.companion-dock').isHidden())
        await page.keyboard.press('Escape')
      }
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'paused',
      )
      await page.getByRole('button', { name: 'Enable companion movement' }).click()
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'active',
      )
      await page.getByRole('button', { name: 'Pause companion animation' }).click()
      const sameCanvas = await canvas.elementHandle()
      await page
        .getByRole('button', { name: `Switch to ${theme === 'light' ? 'dark' : 'light'} theme` })
        .click()
      assert.ok(
        await page.evaluate(
          (canvas) => canvas === document.querySelector('.companion-canvas canvas'),
          sameCanvas,
        ),
      )
      assert.equal(await host.getAttribute('data-rendering'), 'paused')
      await page.getByRole('button', { name: `Switch to ${theme} theme` }).click()
      await page.evaluate(() => scrollTo(0, 0))
      await page.screenshot({ path: `.qa/companion/${theme}-${width}-page.png` })
      await page
        .locator('.companion-stage')
        .screenshot({ path: `.qa/companion/${theme}-${width}-character.png` })
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      assert.deepEqual(
        axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        [],
        'Accessible controls',
      )
      for (const id of ['about', 'skills', 'projects', 'achievements', 'contact']) {
        await page.evaluate(
          (id) =>
            document.getElementById(id).scrollIntoView({ block: 'center', behavior: 'instant' }),
          id,
        )
        await assertDockClear(page)
      }
      results.push(
        `${theme} ${width}px: automatic dance, mouse/keyboard wave and return, pause/hide/restore, inactive tab, certificates/menu, reduced motion opt-in, stable themed canvas, axe checks.`,
      )
      await context.close()
    }
  const reducedContext = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 360, height: 844 },
  })
  const reduced = await reducedContext.newPage()
  await reduced.goto(base, { waitUntil: 'networkidle' })
  await reduced.locator('.companion-ready').waitFor()
  assert.equal(
    await reduced.locator('.companion-canvas').getAttribute('data-rendering'),
    'paused',
    'Reduced-motion first visit starts static',
  )
  await reducedContext.close()
  const fallbackContext = await browser.newContext({ viewport: { width: 360, height: 844 } })
  const fallback = await fallbackContext.newPage()
  await fallback.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return kind === 'webgl' || kind === 'webgl2' ? null : getContext.call(this, kind, ...args)
    }
  })
  await fallback.goto(base, { waitUntil: 'networkidle' })
  assert.ok(await fallback.locator('.companion-fallback').isVisible())
  assert.equal(await fallback.locator('.companion-canvas canvas').count(), 0)
  await fallback.getByRole('button', { name: 'Hide companion', exact: true }).click()
  await fallback.getByRole('button', { name: 'Restore companion' }).click()
  await fallback.screenshot({ path: '.qa/companion/webgl-fallback.png' })
  await fallbackContext.close()
  results.push(
    'Reduced-motion first visit is static. No-WebGL fallback and hide/restore work. Production audio remains absent.',
  )
  assert.deepEqual(errors, [], 'No browser errors')
  await writeFile('.qa/companion/verification.json', JSON.stringify({ results, errors }, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}
