import { styleText } from 'node:util'
import type { PuppeteerNode } from 'puppeteer'
import type { Resume, Theme } from './types.js'

export const pdf = async (
  html: string,
  resume: Resume,
  themeModule: Theme,
  pptrModuleName = 'puppeteer',
) => {
  let puppeteer: PuppeteerNode

  try {
    puppeteer = await import(pptrModuleName)
  } catch {
    throw new Error(
      `Could not import ${styleText('yellow', pptrModuleName)} package. Is it installed?`,
    )
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'networkidle0' })
  const rendered = await page.pdf({
    ...themeModule.pdfRenderOptions,
    ...resume.meta?.pdfRenderOptions,
  })
  await browser.close()

  return rendered
}
