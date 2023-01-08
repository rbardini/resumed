import { promises as fs } from 'fs'
// @ts-ignore
import * as theme from 'jsonresume-theme-even'
import { init, render, validate } from '../src'
import { cli } from '../src/cli'

jest.mock('fs', () => {
  const fs = jest.requireActual('fs')

  return {
    ...fs,
    promises: {
      ...fs.promises,
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  }
})

jest.mock('../src')

const logSpy = jest.spyOn(console, 'log').mockImplementation()
const errorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('init', () => {
  it('creates a sample resume with default filename', async () => {
    await cli.parse(['', '', 'init'])

    expect(init).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledWith('resume.json')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Done! Start editing [33mresume.json[39m now, and run the [33mrender[39m command when you are ready. 👍"`,
    )
  })

  it('creates a sample resume with custom filename', async () => {
    await cli.parse(['', '', 'init', 'custom.json'])

    expect(init).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledWith('custom.json')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Done! Start editing [33mcustom.json[39m now, and run the [33mrender[39m command when you are ready. 👍"`,
    )
  })
})

describe('render', () => {
  it('renders a resume with default filename', async () => {
    const resume = {}

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render', '--theme', 'jsonresume-theme-even'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mresume.html[39m. Nice work! 🚀"`,
    )
  })

  it('renders a resume with custom filename', async () => {
    const resume = {}

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse([
      '',
      '',
      'render',
      'custom.json',
      '--theme',
      'jsonresume-theme-even',
    ])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('custom.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mresume.html[39m. Nice work! 🚀"`,
    )
  })

  it('renders a resume with custom output', async () => {
    const resume = {}

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse([
      '',
      '',
      'render',
      '--theme',
      'jsonresume-theme-even',
      '--output',
      'custom-output.html',
    ])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('custom-output.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mcustom-output.html[39m. Nice work! 🚀"`,
    )
  })

  it('renders a resume with theme defined via the `.meta.theme` field', async () => {
    const resume = { meta: { theme: 'jsonresume-theme-even' } }

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mresume.html[39m. Nice work! 🚀"`,
    )
  })

  it('asks to define a theme if none specified and exits with failure code', async () => {
    const resume = {}

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))

    await cli.parse(['', '', 'render'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"No theme to use. Please specify one via the [33m--theme[39m option or the [33m.meta.theme[39m field of your resume."`,
    )

    expect(render).not.toHaveBeenCalled()
    expect(process.exitCode).toBe(1)
  })

  it('asks if theme is installed if theme cannot be loaded and exits with failure code', async () => {
    const resume = {}

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))

    await cli.parse(['', '', 'render', '--theme', 'jsonresume-theme-missing'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Could not load theme [33mjsonresume-theme-missing[39m. Is it installed?"`,
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
      `"Your [33mresume.json[39m looks amazing! ✨"`,
    )
  })

  it('validates a resume with custom filename', async () => {
    await cli.parse(['', '', 'validate', 'custom.json'])

    expect(validate).toHaveBeenCalledTimes(1)
    expect(validate).toHaveBeenCalledWith('custom.json')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Your [33mcustom.json[39m looks amazing! ✨"`,
    )
  })

  it('rethrows error if not an array', async () => {
    const error = new Error('validate')
    jest.mocked(validate).mockImplementationOnce(() => {
      throw error
    })

    await expect(cli.parse(['', '', 'validate'])).rejects.toThrow(error)
  })

  it('lists validation errors and exits with failure code', async () => {
    const errors = [...Array(3).keys()].map(i => ({
      message: `message ${i}`,
      path: `path ${i}`,
    }))
    jest.mocked(validate).mockRejectedValueOnce(errors)

    await cli.parse(['', '', 'validate'])

    expect(errorSpy).toHaveBeenCalledTimes(errors.length + 1)
    expect(errorSpy.mock.calls.join('\n')).toMatchInlineSnapshot(`
      "Uh-oh! The following errors were found in [33mresume.json[39m:

       [31m❌ message 0[39m at [33mpath 0[39m.
       [31m❌ message 1[39m at [33mpath 1[39m.
       [31m❌ message 2[39m at [33mpath 2[39m."
    `)
    expect(process.exitCode).toBe(1)
  })
})
