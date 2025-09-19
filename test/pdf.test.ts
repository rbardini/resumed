import * as puppeteer from 'puppeteer'
import { expect, it, vi } from 'vitest'
import { pdf } from '../src/pdf.js'

vi.mock('puppeteer', () => ({
  launch: vi.fn().mockResolvedValue({
    newPage: vi.fn().mockResolvedValue({
      setContent: vi.fn(),
      pdf: vi.fn().mockResolvedValue('pdf'),
    }),
    close: vi.fn(),
  }),
}))

it('exports a resume to PDF', async () => {
  const resume = require('@jsonresume/schema/sample.resume.json')
  const theme = {
    render: vi.fn(({ basics: { name } }) => name),
  }

  await expect(pdf('html', resume, theme)).resolves.toBe('pdf')
  expect(puppeteer.launch).toHaveBeenCalledWith({ args: [] })
})

it('exports a resume to PDF with custom Puppeteer args', async () => {
  const resume = require('@jsonresume/schema/sample.resume.json')
  const theme = {
    render: vi.fn(({ basics: { name } }) => name),
  }
  const args = ['--no-sandbox']

  await expect(pdf('html', resume, theme, { args })).resolves.toBe('pdf')
  expect(puppeteer.launch).toHaveBeenCalledWith({ args })
})

it('asks if Puppeteer package is installed if importing fails', async () => {
  const resume = require('@jsonresume/schema/sample.resume.json')
  const theme = {
    render: vi.fn(({ basics: { name } }) => name),
  }

  await expect(() =>
    pdf('html', resume, theme, { moduleName: 'non-puppeteer' }),
  ).rejects.toThrow('Could not import non-puppeteer package. Is it installed?')
})
