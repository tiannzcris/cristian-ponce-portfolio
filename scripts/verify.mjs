import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:4173'
await mkdir('.qa', { recursive: true })
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
})
const errors = []
const results = []
const createPage = async (options) => {
  const context = await browser.newContext(options)
  return context.newPage()
}
const captureErrors = (page) => {
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(base))
      errors.push(`${response.status()} ${response.url()}`)
  })
}
async function checkLayout(page, width) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll('main *')]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .map((el) => el.className)
      .slice(0, 10),
  }))
  assert.ok(overflow.page <= overflow.viewport, `${width}px overflow: ${JSON.stringify(overflow)}`)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      [...document.images].map((image) => {
        image.loading = 'eager'
        return image.decode().catch(() => {})
      }),
    )
  })
  assert.deepEqual(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
      ),
    [],
    'All images must load',
  )
}
try {
  const page = await createPage({ viewport: { width: 1440, height: 1000 } })
  captureErrors(page)
  assert.equal((await page.goto(base, { waitUntil: 'networkidle' })).status(), 200)
  await page.locator('.hero-visual.scene-ready').waitFor()
  await page.waitForFunction(
    () => document.querySelector('.network-canvas').dataset.rendering === 'active',
  )
  await page.getByRole('button', { name: 'Pause 3D animation' }).click()
  assert.equal(await page.locator('.network-canvas').getAttribute('data-rendering'), 'paused')
  await page.getByRole('button', { name: 'Play 3D animation' }).click()
  await page.waitForFunction(
    () => document.querySelector('.network-canvas').dataset.rendering === 'active',
  )
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  assert.equal(await page.locator('.network-canvas').getAttribute('data-rendering'), 'paused')
  await page.evaluate(() => {
    delete document.hidden
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForFunction(
    () => document.querySelector('.network-canvas').dataset.rendering === 'active',
  )
  await checkLayout(page, 1440)
  await page.screenshot({ path: '.qa/desktop-hero.png' })
  await page.screenshot({ path: '.qa/desktop-full.png', fullPage: true })
  results.push('Desktop: 1440px, WebGL renders, pause/play and tab visibility handler work')

  // All anchor destinations exist; every project and social link is HTTPS and usable.
  const links = await page
    .locator('a')
    .evaluateAll((items) =>
      items.map((a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel })),
    )
  for (const link of links) {
    assert.ok(link.href && link.href !== '#', 'No empty links')
    if (link.href.startsWith('#'))
      assert.equal(await page.locator(link.href).count(), 1, `Target ${link.href}`)
    else {
      assert.match(link.href, /^https:\/\//)
      assert.equal(link.target, '_blank')
      assert.ok(link.rel.includes('noopener'))
    }
  }
  for (const label of ['About', 'Skills', 'Projects', 'Achievements', 'Contact']) {
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: label })
      .click()
    await page.waitForFunction((id) => {
      const top = document.getElementById(id).getBoundingClientRect().top
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      return top >= 80 && (top < 130 || atBottom)
    }, label.toLowerCase())
  }
  await page.waitForFunction(
    () => document.querySelector('.network-canvas').dataset.rendering === 'paused',
  )
  results.push(
    'Navigation: all anchors land below the sticky header; offscreen rendering pauses; external link attributes pass',
  )

  const certificateButtons = page.locator('button[aria-label^="View "][aria-label$="certificate"]')
  assert.equal(await certificateButtons.count(), 6)
  for (let i = 0; i < 6; i++) {
    const trigger = certificateButtons.nth(i)
    await trigger.click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor({ state: 'visible' })
    assert.ok(
      await page
        .getByRole('button', { name: 'Close certificate' })
        .evaluate((el) => el === document.activeElement),
    )
    await dialog.locator('img').evaluate((img) => img.decode())
    assert.equal(
      await dialog.locator('img').evaluate((img) => getComputedStyle(img).objectFit),
      'contain',
    )
    await page.keyboard.press('Shift+Tab')
    assert.ok(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
      'Dialog traps focus',
    )
    if (i === 3) await page.screenshot({ path: '.qa/topcit-viewer.png' })
    if (i % 2 === 0) await page.keyboard.press('Escape')
    else await page.getByRole('button', { name: 'Close certificate' }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.ok(
      await trigger.evaluate((el) => el === document.activeElement),
      'Focus returns to the certificate trigger',
    )
  }
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  assert.deepEqual(
    audit.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    'Desktop accessibility audit',
  )
  results.push(
    'All six certificates: full-image view, close button, Escape, focus trap and focus return; desktop WCAG automated audit passes',
  )

  for (const width of [360, 390, 768, 1024]) {
    const mobile = await createPage({
      viewport: { width, height: 844 },
      isMobile: width < 650,
      hasTouch: width < 650,
      reducedMotion: 'reduce',
    })
    captureErrors(mobile)
    await mobile.goto(base, { waitUntil: 'networkidle' })
    await checkLayout(mobile, width)
    if (width <= 768) {
      const menu = mobile.getByRole('button', { name: 'Open navigation' })
      await menu.focus()
      await mobile.keyboard.press('Enter')
      assert.equal(
        await mobile
          .getByRole('button', { name: 'Close navigation' })
          .getAttribute('aria-expanded'),
        'true',
      )
      await mobile.keyboard.press('Escape')
      assert.ok(await menu.evaluate((el) => el === document.activeElement))
      if (width < 650) await menu.tap()
      else await menu.click()
      await mobile.getByRole('navigation').getByRole('link', { name: 'Projects' }).click()
      assert.equal(await menu.getAttribute('aria-expanded'), 'false')
      assert.equal(await mobile.evaluate(() => document.activeElement.id), 'projects')
      const top = await mobile.locator('#projects').evaluate((el) => el.getBoundingClientRect().top)
      assert.ok(top >= 72 && top < 110, `Mobile target below header: ${top}`)
    }
    await mobile.evaluate(() => window.scrollTo(0, 0))
    await mobile.locator('.hero-visual.scene-ready').waitFor()
    assert.equal(await mobile.locator('.network-canvas').getAttribute('data-rendering'), 'paused')
    assert.equal(
      await mobile.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
      'auto',
    )
    await mobile.screenshot({ path: `.qa/layout-${width}.png`, fullPage: true })
    if (width === 360) {
      const mobileAudit = await new AxeBuilder({ page: mobile })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      assert.deepEqual(
        mobileAudit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        [],
        'Mobile accessibility audit',
      )
      await mobile.getByRole('button', { name: 'View TOPCIT · Level 2 certificate' }).click()
      await mobile
        .getByRole('dialog')
        .locator('img')
        .evaluate((img) => img.decode())
      await mobile.screenshot({ path: '.qa/mobile-certificate.png' })
      const dialogAudit = await new AxeBuilder({ page: mobile })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      assert.deepEqual(
        dialogAudit.violations.map((v) => v.id),
        [],
        'Dialog accessibility audit',
      )
      await mobile.keyboard.press('Escape')
    }
    await mobile.close()
    results.push(
      `${width}px: no horizontal overflow or broken images; reduced motion; ${width <= 768 ? 'keyboard/touch menu and anchors' : 'tablet landscape'}`,
    )
  }
  const fallback = await createPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  })
  captureErrors(fallback)
  await fallback.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === 'webgl' || kind === 'webgl2') return null
      return getContext.call(this, kind, ...args)
    }
  })
  await fallback.goto(base, { waitUntil: 'networkidle' })
  assert.equal(await fallback.locator('.hero-visual.scene-ready').count(), 0)
  assert.equal(
    await fallback.locator('.network-fallback').evaluate((el) => getComputedStyle(el).opacity),
    '1',
  )
  assert.ok(await fallback.getByRole('heading', { level: 1 }).isVisible())
  await fallback.getByRole('link', { name: 'View My Work' }).click()
  await fallback.getByRole('button', { name: 'View Web Development Champion certificate' }).click()
  await fallback.getByRole('dialog').waitFor({ state: 'visible' })
  await fallback.keyboard.press('Escape')
  await fallback.evaluate(() => window.scrollTo(0, 0))
  await fallback.screenshot({ path: '.qa/webgl-fallback.png' })
  results.push(
    'WebGL unavailable: static illustration, headline, CTA, and certificate viewer remain functional',
  )
  assert.deepEqual(errors, [], 'No browser exceptions, console errors, or failing local responses')
  results.push('No browser exceptions, console errors, or broken local responses')
  await writeFile('.qa/verification.json', JSON.stringify({ results, errors }, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}
