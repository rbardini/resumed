import { readFile } from 'node:fs/promises'
import { text } from 'node:stream/consumers'
import { expect, it, vi } from 'vitest'
import { validate } from '../src/validate.js'

vi.mock('node:fs/promises', async () => ({
  readFile: vi.fn(),
}))

vi.mock('node:stream/consumers', () => ({
  text: vi.fn(),
}))

it('passes a valid resume', async () => {
  vi.mocked(readFile).mockResolvedValueOnce(
    JSON.stringify({ basics: { name: 'Richard Hendriks' } }),
  )

  await expect(validate('resume.json')).resolves.toStrictEqual(true)
  expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')
})

it('passes a valid resume from stdin', async () => {
  vi.mocked(text).mockResolvedValueOnce(
    JSON.stringify({ basics: { name: 'Richard Hendriks' } }),
  )

  await expect(validate()).resolves.toStrictEqual(true)
  expect(text).toHaveBeenCalledWith(process.stdin)
})

it('fails an invalid resume', async () => {
  vi.mocked(readFile).mockResolvedValueOnce(
    JSON.stringify({ basics: { name: 123 } }),
  )

  await expect(validate('resume.json')).rejects.toStrictEqual([
    expect.objectContaining({
      stack: 'instance.basics.name is not of a type(s) string',
    }),
  ])
})
