import { promises as fs } from 'fs'
import { init, loadThemes, render, validate } from '../src'
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
    const resume = { resume: {} }
    const loadedThemes = [
      { module: { render: 'theme1' }, name: 'theme1', path: '/theme1' },
    ]

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(loadThemes).mockResolvedValueOnce(loadedThemes)
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(loadThemes).toHaveBeenCalledTimes(1)
    expect(loadThemes).toHaveBeenCalledWith(undefined)

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, loadedThemes[0].module)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mresume.html[39m. Nice work! 🚀"`,
    )
  })

  it('renders a resume with custom filename', async () => {
    const resume = { resume: {} }
    const loadedThemes = [
      { module: { render: 'theme1' }, name: 'theme1', path: '/theme1' },
    ]

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(loadThemes).mockResolvedValueOnce(loadedThemes)
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render', 'custom.json'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('custom.json', 'utf-8')

    expect(loadThemes).toHaveBeenCalledTimes(1)
    expect(loadThemes).toHaveBeenCalledWith(undefined)

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, loadedThemes[0].module)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mresume.html[39m. Nice work! 🚀"`,
    )
  })

  it('renders a resume with first theme found when multiple are installed', async () => {
    const resume = { resume: {} }
    const loadedThemes = [
      { module: { render: 'theme1' }, name: 'theme1', path: '/theme1' },
      { module: { render: 'theme2' }, name: 'theme2', path: '/theme2' },
    ]

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(loadThemes).mockResolvedValueOnce(loadedThemes)
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(loadThemes).toHaveBeenCalledTimes(1)
    expect(loadThemes).toHaveBeenCalledWith(undefined)

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, loadedThemes[0].module)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(`
      "Found 2 JSON Resume themes installed, defaulting to [33mtheme1[39m. Pass the [33m--theme[39m option if you would like to use another one.
      You can find your rendered resume at [33mresume.html[39m. Nice work! 🚀"
    `)
  })

  it('renders a resume with specific theme', async () => {
    const resume = { resume: {} }

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest
      .mocked(loadThemes)
      .mockImplementationOnce(theme =>
        Promise.resolve([
          { module: { render: theme }, name: theme!, path: `/${theme}` },
        ]),
      )
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render', '--theme', 'custom-theme'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(loadThemes).toHaveBeenCalledTimes(1)
    expect(loadThemes).toHaveBeenCalledWith('custom-theme')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, { render: 'custom-theme' })

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mresume.html[39m. Nice work! 🚀"`,
    )
  })

  it('renders a resume with custom output', async () => {
    const resume = { resume: {} }
    const loadedThemes = [
      { module: { render: 'theme1' }, name: 'theme1', path: '/theme1' },
    ]

    jest.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(resume))
    jest.mocked(loadThemes).mockResolvedValueOnce(loadedThemes)
    jest.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render', '--output', 'custom-output.html'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(loadThemes).toHaveBeenCalledTimes(1)
    expect(loadThemes).toHaveBeenCalledWith(undefined)

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, { render: 'theme1' })

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledWith('custom-output.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at [33mcustom-output.html[39m. Nice work! 🚀"`,
    )
  })

  it('asks to install a theme if none found and exits with failure code', async () => {
    jest.mocked(fs.readFile).mockResolvedValueOnce('{}')
    jest.mocked(loadThemes).mockResolvedValueOnce([])

    await cli.parse(['', '', 'render'])

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(loadThemes).toHaveBeenCalledTimes(1)
    expect(loadThemes).toHaveBeenCalledWith(undefined)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Could not find a JSON Resume theme to render. Try installing one (e.g. [33mnpm i jsonresume-theme-even[39m) and run the command again. 😉"`,
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

    expect(logSpy).toHaveBeenCalledTimes(errors.length + 1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(`
      "Uh-oh! The following errors were found in [33mresume.json[39m:

       [31m❌ message 0[39m at [33mpath 0[39m.
       [31m❌ message 1[39m at [33mpath 1[39m.
       [31m❌ message 2[39m at [33mpath 2[39m."
    `)
    expect(process.exitCode).toBe(1)
  })
})
