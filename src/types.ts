import type { PDFOptions } from 'puppeteer'

export type Resume = any

export type Theme<T = string> = {
  render: (resume: Resume) => T | Promise<T>
  pdfRenderOptions: PDFOptions
}
