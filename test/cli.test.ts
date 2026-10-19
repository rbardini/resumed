import schema from '@jsonresume/schema'
import * as theme from 'jsonresume-theme-even'
import { readFile, writeFile } from 'node:fs/promises'
import { text } from 'node:stream/consumers'
import { promisify } from 'node:util'
import { describe, expect, it, vi } from 'vitest'
import { cli } from '../src/cli.js'
import { init, pdf, render, validate } from '../src/index.js'

vi.mock('node:fs/promises', async () => ({
  readFile: vi
    .fn()
    .mockResolvedValueOnce(
      JSON.stringify({ name: 'resumed', version: '0.0.0' }),
    ),
  writeFile: vi.fn(),
}))

vi.mock('node:stream/consumers', () => ({
  text: vi.fn(),
}))

vi.mock('../src')

const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

const schemaValidate = promisify(schema.validate)

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

  it('renders a resume with comments', async () => {
    const resume = `//Template\n{"basics":{"name":"Benny"}}`

    vi.mocked(readFile).mockResolvedValueOnce(resume)
    vi.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse(['', '', 'render', '--theme', 'jsonresume-theme-even'])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith('resume.html', 'rendered')
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
    expect(writeFile).toHaveBeenCalledWith('custom.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at custom.html. Nice work! 🚀"`,
    )
  })

  it('renders a resume from stdin', async () => {
    const resume = {}

    vi.mocked(text).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')

    await cli.parse([
      '',
      '',
      'render',
      '--stdin',
      '--theme',
      'jsonresume-theme-even',
    ])

    expect(text).toHaveBeenCalledTimes(1)
    expect(text).toHaveBeenCalledWith(process.stdin)

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith('resume.html', 'rendered')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your rendered resume at resume.html. Nice work! 🚀"`,
    )
  })

  it('rejects using a filename with the `--stdin` option', async () => {
    await expect(
      cli.parse(['', '', 'render', 'resume.json', '--stdin']),
    ).rejects.toThrow('Cannot use a filename together with the --stdin option.')

    expect(render).not.toHaveBeenCalled()
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

    await expect(() => cli.parse(['', '', 'render'])).rejects.toThrow(
      'No theme to use. Please specify one via the --theme option or the .meta.theme field of your resume.',
    )

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).not.toHaveBeenCalled()
  })

  it('asks if theme is installed if theme cannot be loaded and exits with failure code', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))

    await expect(() =>
      cli.parse(['', '', 'render', '--theme', 'jsonresume-theme-missing']),
    ).rejects.toThrow(
      'Could not load theme jsonresume-theme-missing. Is it installed?',
    )

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).not.toHaveBeenCalled()
  })
})

describe('export', () => {
  it('exports a resume with default filename', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')
    vi.mocked(pdf).mockResolvedValueOnce(new TextEncoder().encode('pdf'))

    await cli.parse(['', '', 'export', '--theme', 'jsonresume-theme-even'])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(pdf).toHaveBeenCalledTimes(1)
    expect(pdf).toHaveBeenCalledWith('rendered', resume, theme, { args: [] })

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      'resume.pdf',
      new TextEncoder().encode('pdf'),
    )
  })

  it('exports a resume from stdin', async () => {
    const resume = {}

    vi.mocked(text).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')
    vi.mocked(pdf).mockResolvedValueOnce(new TextEncoder().encode('pdf'))

    await cli.parse([
      '',
      '',
      'export',
      '--stdin',
      '--theme',
      'jsonresume-theme-even',
    ])

    expect(text).toHaveBeenCalledTimes(1)
    expect(text).toHaveBeenCalledWith(process.stdin)

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(pdf).toHaveBeenCalledTimes(1)
    expect(pdf).toHaveBeenCalledWith('rendered', resume, theme, { args: [] })

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      'resume.pdf',
      new TextEncoder().encode('pdf'),
    )
  })

  it('exports a resume with custom output', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')
    vi.mocked(pdf).mockResolvedValueOnce(new TextEncoder().encode('pdf'))

    await cli.parse([
      '',
      '',
      'export',
      '--theme',
      'jsonresume-theme-even',
      '--output',
      'custom-output.pdf',
    ])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(pdf).toHaveBeenCalledTimes(1)
    expect(pdf).toHaveBeenCalledWith('rendered', resume, theme, { args: [] })

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      'custom-output.pdf',
      new TextEncoder().encode('pdf'),
    )

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls.join('\n')).toMatchInlineSnapshot(
      `"You can find your exported resume at custom-output.pdf. Nice work! 🚀"`,
    )
  })

  it('exports a resume with custom Puppeteer args', async () => {
    const resume = {}

    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(resume))
    vi.mocked(render).mockResolvedValueOnce('rendered')
    vi.mocked(pdf).mockResolvedValueOnce(new TextEncoder().encode('pdf'))

    await cli.parse([
      '',
      '',
      'export',
      '--theme',
      'jsonresume-theme-even',
      '--puppeteer-arg=--no-sandbox',
    ])

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('resume.json', 'utf-8')

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(resume, theme)

    expect(pdf).toHaveBeenCalledTimes(1)
    expect(pdf).toHaveBeenCalledWith('rendered', resume, theme, {
      args: ['--no-sandbox'],
    })
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

  it('validates a resume from stdin', async () => {
    await cli.parse(['', '', 'validate', '--stdin'])

    expect(validate).toHaveBeenCalledTimes(1)
    expect(validate).toHaveBeenCalledWith(undefined)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Your stdin looks amazing! ✨"`,
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
    const errors = (await schemaValidate({
      basics: { name: 123, email: 456 },
      work: 'dummy',
    }).catch(err => err)) as object[]
    vi.mocked(validate).mockRejectedValueOnce(errors)

    await cli.parse(['', '', 'validate'])

    expect(errorSpy).toHaveBeenCalledTimes(errors.length + 1)
    expect(errorSpy.mock.calls.join('\n')).toMatchInlineSnapshot(`
      "Uh-oh! The following errors were found in resume.json:

       ❌ is not of a type(s) string at basics.name.
       ❌ is not of a type(s) string at basics.email.
       ❌ is not of a type(s) array at work."
    `)
    expect(process.exitCode).toBe(1)
  })
})
