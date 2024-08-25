import { writeFile } from 'node:fs/promises'
import { expect, it, vi } from 'vitest'
import { init } from '../src/init.js'

vi.mock('node:fs/promises', async () => ({
  writeFile: vi.fn(),
}))

it('initializes a resume', async () => {
  vi.mocked(writeFile).mockResolvedValueOnce()
  await expect(init('resume.json')).resolves.toBeUndefined()
})

it('throws if write fails', async () => {
  vi.mocked(writeFile).mockRejectedValueOnce('error')
  await expect(init('resume.json')).rejects.toBe('error')
})
