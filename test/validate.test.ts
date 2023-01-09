import { readFile } from 'node:fs/promises'
import { expect, it, vi } from 'vitest'
import { validate } from '../src/validate'

vi.mock('node:fs/promises', async () => ({
  readFile: vi.fn(),
}))

it('passes a valid resume', async () => {
  vi.mocked(readFile).mockResolvedValueOnce(
    JSON.stringify({ basics: { name: 'Richard Hendriks' } }),
  )

  await expect(validate('resume.json')).resolves.toStrictEqual({
    valid: true,
  })
})

it('fails an invalid resume', async () => {
  vi.mocked(readFile).mockResolvedValueOnce(
    JSON.stringify({ unknown: { name: 'Richard Hendriks' } }),
  )

  await expect(validate('resume.json')).rejects.toStrictEqual([
    expect.objectContaining({
      code: 'OBJECT_ADDITIONAL_PROPERTIES',
      message: 'Additional properties not allowed: unknown',
      params: ['unknown'],
      path: '#/',
    }),
  ])
})
