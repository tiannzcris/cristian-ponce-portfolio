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
async function assertFixedThroughScroll(page, label) {
  const result = await page.evaluate(async () => {
    const dock = document.querySelector('.companion-dock')
    const baseline = dock.getBoundingClientRect()
    let maxDrift = 0,
      samples = 0,
      alwaysVisible = true
    const inspect = () => {
      const box = dock.getBoundingClientRect()
      maxDrift = Math.max(maxDrift, Math.abs(box.x - baseline.x), Math.abs(box.y - baseline.y))
      alwaysVisible &&=
        !!dock.getClientRects().length && box.bottom <= innerHeight && box.right <= innerWidth
      samples++
    }
    // A page transform must not establish the companion's containing block.
    const root = document.getElementById('root')
    const previous = root.style.transform
    // Create a containing block without enlarging the mobile layout viewport through overflow.
    root.style.transform = 'translateZ(0)'
    inspect()
    root.style.transform = previous
    for (const duration of [2200, 160]) {
      for (const down of [true, false]) {
        const maximum = document.documentElement.scrollHeight - innerHeight
        const start = performance.now()
        let progress
        do {
          progress = Math.min(1, (performance.now() - start) / duration)
          scrollTo({ top: maximum * (down ? progress : 1 - progress), behavior: 'instant' })
          inspect()
          await new Promise(requestAnimationFrame)
          inspect()
        } while (progress < 1)
        if (down) {
          await new Promise((resolve) => setTimeout(resolve, 120))
          inspect()
        }
      }
    }
    scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    inspect()
    const footer = document.querySelector('.site-footer').getBoundingClientRect()
    const corner = document.elementFromPoint(baseline.left + 2, baseline.top + 2)
    return {
      maxDrift,
      samples,
      alwaysVisible,
      portal: dock.parentElement === document.body,
      position: getComputedStyle(dock).position,
      bottom: innerHeight - baseline.bottom,
      right: innerWidth - baseline.right,
      footerVisible: footer.top < innerHeight && footer.bottom > 0,
      transparentCornerPassesThrough: !dock.contains(corner),
      footerLinksClear: [...document.querySelectorAll('.site-footer a')].every((link) => {
        const box = link.getBoundingClientRect()
        return link.contains(
          document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
        )
      }),
    }
  })
  assert.equal(result.position, 'fixed')
  assert.equal(result.portal, true)
  assert.equal(result.bottom, 12)
  assert.equal(result.right, 12)
  assert.ok(result.maxDrift < 0.5, JSON.stringify(result))
  assert.ok(result.alwaysVisible && result.footerVisible, JSON.stringify(result))
  assert.ok(result.transparentCornerPassesThrough, 'Empty canvas corners pass clicks through')
  assert.ok(result.footerLinksClear, 'Footer links and back-to-top remain clickable')
  results.push(
    `${label}: slow/fast top-to-footer-and-back, ${result.samples} samples, ${result.maxDrift}px drift; visible at footer; body portal escapes root transform; transparent corner passes clicks.`,
  )
  await page.screenshot({ path: `.qa/companion/${label}-footer.png` })
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
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
      assert.equal(await page.locator('.companion-dock button').count(), 1, 'Only greeting remains')
      assert.equal(await page.locator('audio').count(), 1, 'Production uses one music element')
      assert.ok(
        audioRequests.some((url) => url.endsWith('/audio/background.mp3')),
        'Production loads the supplied track',
      )
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
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      assert.equal(await host.getAttribute('data-rendering'), 'hidden')
      const hiddenDraws = await canvas.getAttribute('data-test-draws')
      await page.waitForTimeout(180)
      assert.equal(
        await canvas.getAttribute('data-test-draws'),
        hiddenDraws,
        'Inactive tab issues no WebGL draws',
      )
      await page.evaluate(() => {
        delete document.hidden
        document.dispatchEvent(new Event('visibilitychange'))
      })
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'active',
      )
      await assertFixedThroughScroll(page, `${theme}-${width}`)
      await page.getByRole('button', { name: 'View TOPCIT · Level 2 certificate' }).click()
      assert.ok(await page.locator('.companion-dock').isVisible())
      assert.ok(
        await page.evaluate(() => {
          const box = document.querySelector('.companion-stage').getBoundingClientRect()
          const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
          return document.querySelector('dialog').contains(top)
        }),
        'The native modal and its backdrop receive clicks above the companion',
      )
      await page.screenshot({ path: `.qa/companion/${theme}-${width}-dialog.png` })
      await page.keyboard.press('Escape')
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      if (width === 360) {
        await page.getByRole('button', { name: 'Open navigation' }).click()
        assert.ok(await page.locator('.companion-dock').isVisible())
        await page.keyboard.press('Escape')
      }
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'paused',
      )
      const paused = await canvas.getAttribute('data-test-draws')
      await page.waitForTimeout(180)
      assert.equal(
        await canvas.getAttribute('data-test-draws'),
        paused,
        'Reduced motion issues no continuous draws',
      )
      await page.getByRole('button', { name: 'Wave with Cristian’s companion' }).click()
      assert.equal(
        await host.getAttribute('data-pose'),
        'wave',
        'Reduced motion uses a static greeting',
      )
      assert.equal(await host.getAttribute('data-rendering'), 'paused')
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
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.waitForFunction(
        () => document.querySelector('.companion-canvas').dataset.rendering === 'active',
      )
      results.push(
        `${theme} ${width}px: automatic dance, mouse/keyboard wave and return, no visible controls, inactive tab stops draws, modal layering, mobile menu, static reduced motion/greeting, stable themed canvas, axe checks.`,
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
  assert.ok(
    await fallback.getByRole('button', { name: 'Wave with Cristian’s companion' }).isDisabled(),
  )
  await fallback.screenshot({ path: '.qa/companion/webgl-fallback.png' })
  await fallbackContext.close()
  results.push(
    'Reduced-motion first visit is static. No-WebGL fallback remains visible without controls. Production music uses one audio element.',
  )
  assert.deepEqual(errors, [], 'No browser errors')
  await writeFile('.qa/companion/verification.json', JSON.stringify({ results, errors }, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}
