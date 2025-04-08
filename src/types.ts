import type { PDFOptions } from 'puppeteer'
import type { ResumeSchema } from './resume-schema.d.js'

export type PDFRenderOptions = PDFOptions
export type Resume = ResumeSchema & {
  meta?: {
    pdfRenderOptions?: PDFRenderOptions
  }
}

export type Theme<T = string> = {
  render: (resume: Resume) => T | Promise<T>
  pdfRenderOptions?: PDFRenderOptions
}
