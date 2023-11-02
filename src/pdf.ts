import type { PuppeteerNode } from 'puppeteer'
import { yellow } from 'yoctocolors'
import type { Resume, Theme } from './types.js'

const PUPPETEER_PACKAGE_NAME = 'puppeteer'

export const pdf = async (html: string, resume: Resume, themeModule: Theme) => {
  let puppeteer: PuppeteerNode

  try {
    puppeteer = await import(PUPPETEER_PACKAGE_NAME)
  } catch {
    throw new Error(
      `Could not import ${yellow(PUPPETEER_PACKAGE_NAME)} package. Is it installed?`,
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
