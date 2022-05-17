import { promises as fs } from 'fs'
import * as theme from 'jsonresume-theme-even'
import puppeteer from 'puppeteer'
import { render } from 'resumed'

const resume = JSON.parse(await fs.readFile('resume.json', 'utf-8'))
const html = await render(resume, theme)

const browser = await puppeteer.launch()
const page = await browser.newPage()

await page.setContent(html, { waitUntil: 'networkidle0' })
await page.pdf({ path: 'resume.pdf', format: 'a4', printBackground: true })
await browser.close()
