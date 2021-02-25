import fs from 'fs'
import { mocked } from 'ts-jest/utils'
import { validate } from '../src/validate'

jest.mock('fs', () => ({
  promises: { readFile: jest.fn() },
}))

it('passes a valid resume', async () => {
  mocked(fs.promises).readFile.mockResolvedValueOnce(
    JSON.stringify({
      basics: { name: 'Richard Hendriks' },
    }),
  )

  await expect(validate('resume.json')).resolves.toStrictEqual({
    valid: true,
  })
})

it('fails an invalid resume', async () => {
  mocked(fs.promises).readFile.mockResolvedValueOnce(
    JSON.stringify({
      unknown: { name: 'Richard Hendriks' },
    }),
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
