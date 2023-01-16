import { readFile, writeFile } from 'node:fs/promises'
import * as theme from 'jsonresume-theme-even'
import { describe, expect, it, vi } from 'vitest'
import { init, render, validate } from '../src'
import { cli } from '../src/cli'

vi.mock('node:fs/promises', async () => ({
  readFile: vi
    .fn()
    .mockResolvedValueOnce(
      JSON.stringify({ name: 'resumed', version: '0.0.0' }),
    ),
  writeFile: vi.fn(),
}))

vi.mock('../src')

const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('init', () => {
  it('creates a sample resume with default filename', async () => {
    await cli.parse(['', '', 'init'])

    expect(init).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledWith('resume.json')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Done! Start editing resume.json now, and run the render command when you are ready. 👍"`,
    )
  })

  it('creates a sample resume with custom filename', async () => {
    await cli.parse(['', '', 'init', 'custom.json'])

    expect(init).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledWith('custom.json')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Done! Start editing custom.json now, and run the render command when you are ready. 👍"`,
    )
  })
})

describe('render', () => {
  it('renders a resume with default filename', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render', '--theme', 'jsonresume-theme-even'])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at resume.html. Nice work! 🚀"`,
    )
  })

  it('renders a resume with custom filename', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse([
      '',
      '',
      'render',
      'custom.json',
      '--theme',
      'jsonresume-theme-even',
    ])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('custom.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at resume.html. Nice work! 🚀"`,
    )
  })

  it('renders a resume with custom output', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse([
      '',
      '',
      'render',
      '--theme',
      'jsonresume-theme-even',
      '--output',
      'custom-output.html',
    ])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith('custom-output.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at custom-output.html. Nice work! 🚀"`,
    )
  })

  it('renders a resume with theme defined via the `.meta.theme` field', async () => {
    const resume = { meta: { theme: 'jsonresume-theme-even' } }

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render'])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at resume.html. Nice work! 🚀"`,
    )
  })

  it('asks to define a theme if none specified and exits with failure code', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))

    await cli.parse(['', '', 'render'])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"No theme to use. Please specify one via the --theme option or the .meta.theme field of your resume."`,
    )

    expect(render).not.toHaveBeenCalled()
    expect(process.exitCode).toBe(1)
  })

  it('asks if theme is installed if theme cannot be loaded and exits with failure code', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))

    await cli.parse(['', '', 'render', '--theme', 'jsonresume-theme-missing'])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Could not load theme jsonresume-theme-missing. Is it installed?"`,
    )

    expect(render).not.toHaveBeenCalled()
    expect(process.exitCode).toBe(1)
  })
})

describe('validate', () => {
  it('validates a resume with default filename', async () => {
    await cli.parse(['', '', 'validate'])

    expect(validate).toHaveBeenCalledTimes(1)
    expect(validate).toHaveBeenCalledWith('resume.json')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Your resume.json looks amazing! ✨"`,
    )
  })

  it('validates a resume with custom filename', async () => {
    await cli.parse(['', '', 'validate', 'custom.json'])

    expect(validate).toHaveBeenCalledTimes(1)
    expect(validate).toHaveBeenCalledWith('custom.json')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Your custom.json looks amazing! ✨"`,
    )
  })

  it('rethrows error if not an array', async () => {
    const error = new Error('validate')
    vi.mocked(validate).mockImplementationOnce(() => {
      throw error
    })

    await expect(cli.parse(['', '', 'validate'])).rejects.toThrow(error)
  })

  it('lists validation errors and exits with failure code', async () => {
    const errors = [...Array(3).keys()].map(i => ({
      message: `message ${i}`,
      path: `path ${i}`,
    }))
    vi.mocked(validate).mockRejectedValueOnce(errors)

    await cli.parse(['', '', 'validate'])

    expect(errorSpy).toHaveBeenCalledTimes(errors.length + 1)
    expect(errorSpy.mock.calls.join('\n')).toMatchInlineSnapshot(`
      "Uh-oh! The following errors were found in resume.json:

       ❌ message 0 at path 0.
       ❌ message 1 at path 1.
       ❌ message 2 at path 2."
    `)
    expect(process.exitCode).toBe(1)
  })
})
