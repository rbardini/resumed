import { readFile } from 'node:fs/promises'
import { expect, it, vi } from 'vitest'
import { validate } from '../src/validate.js'

vi.mock('node:fs/promises', async () => ({
  readFile: vi.fn(),
}))

it('passes a valid resume', async () => {
  vi.mocked(readFile).mockResolvedValueOnce(
    JSON.stringify({ basics: { name: 'Richard Hendriks' } }),
  )

  await expect(validate('resume.json')).resolves.toStrictEqual(true)
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
