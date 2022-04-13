import fs from 'fs'
import { init } from '../src/init'

jest.mock('fs', () => ({
  promises: { writeFile: jest.fn() },
}))

it('initializes a resume', async () => {
  jest.mocked(fs.promises).writeFile.mockResolvedValueOnce()
  await expect(init('resume.json')).resolves.toBeUndefined()
})

it('throws if write fails', async () => {
  jest.mocked(fs.promises).writeFile.mockRejectedValueOnce('error')
  await expect(init('resume.json')).rejects.toBe('error')
})
