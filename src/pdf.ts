import { styleText } from 'node:util'
import type { PuppeteerNode } from 'puppeteer'
import type { Resume, Theme } from './types.js'

type PuppeteerOptions = {
  moduleName?: string
  args?: string[]
}

export const pdf = async (
  html: string,
  resume: Resume,
  themeModule: Theme,
  { moduleName = 'puppeteer', args = [] }: PuppeteerOptions = {},
) => {
  let puppeteer: PuppeteerNode

  try {
    puppeteer = await import(moduleName)
  } catch {
    throw new Error(
      `Could not import ${styleText('yellow', moduleName)} package. Is it installed?`,
    )
  }
  const browser = await puppeteer.launch({ args })
  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'networkidle0' })
  const rendered = await page.pdf({
    ...themeModule.pdfRenderOptions,
    ...resume.meta?.pdfRenderOptions,
  })
  await browser.close()

  return rendered
}
