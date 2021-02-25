import fs from 'fs'
import { mocked } from 'ts-jest/utils'
import { init } from '../src/init'

jest.mock('fs', () => ({
  promises: { writeFile: jest.fn() },
}))

it('initializes a resume', async () => {
  mocked(fs.promises).writeFile.mockResolvedValueOnce()
  await expect(init('resume.json')).resolves.toBeUndefined()
})

it('throws if write fails', async () => {
  mocked(fs.promises).writeFile.mockRejectedValueOnce('error')
  await expect(init('resume.json')).rejects.toBe('error')
})
