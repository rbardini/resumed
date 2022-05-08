const { promises: fs } = require('fs')
const puppeteer = require('puppeteer')
const { loadThemes, render } = require('resumed')

;(async () => {
  const resume = JSON.parse(await fs.readFile('resume.json', 'utf-8'))
  const [loadedTheme] = await loadThemes()
  const html = await render(resume, loadedTheme.module)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.pdf({ path: 'resume.pdf', format: 'a4', printBackground: true })
  await browser.close()
})()
