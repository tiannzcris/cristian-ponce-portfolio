import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.qa/projects', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const results = []
for (const [id, url] of [
  ['e-likas', 'https://e-likasligao.online/'],
  ['windows-server', 'https://windows-server-dictionary.vercel.app/'],
  ['sui-code-camp', 'https://devconsui-move-code-camp2026-level1-sable-nu.vercel.app/'],
]) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  })
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 })
    await page.screenshot({ path: `.qa/projects/${id}.png`, fullPage: false })
    const result = {
      id,
      url,
      status: response?.status(),
      title: await page.title(),
      text: (await page.locator('body').innerText()).slice(0, 12000),
    }
    results.push(result)
    console.log(JSON.stringify(result))
  } catch (error) {
    results.push({ id, url, error: error.message })
    console.log(`${id}: ${error.message}`)
  }
  await page.close()
}
await writeFile('.qa/projects/inspection.json', JSON.stringify(results, null, 2))
await browser.close()
