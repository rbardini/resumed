import { readFile, writeFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { styleText } from 'node:util'
import sade from 'sade'
import stripJsonComments from 'strip-json-comments'
import { init, pdf, render, validate } from './index.js'
import type { Resume, Theme } from './types.js'
import { readInput } from './utils.js'

type RenderOptions = {
  output?: string
  stdin?: boolean
  theme?: string
}

type ExportOptions = RenderOptions & {
  'puppeteer-arg'?: string | string[]
}

enum OutputFormat {
  Html = 'html',
  Pdf = 'pdf',
}

// Trick Rollup into not bundling package.json
const pkgPath = '../package.json'
const pkg = JSON.parse(
  await readFile(new URL(pkgPath, import.meta.url), 'utf-8'),
)

const DEFAULT_FILENAME = 'resume.json'

const getInputFilename = (filename?: string, stdin?: boolean) => {
  if (!stdin) return filename ?? DEFAULT_FILENAME

  if (filename) {
    throw new Error(
      `Cannot use a filename together with the ${styleText('yellow', '--stdin')} option.`,
    )
  }

  return undefined
}

const getOutputFilename = (filename: string | undefined, ext: string) => {
  const inputFilename = filename ?? DEFAULT_FILENAME
  return [basename(inputFilename, extname(inputFilename)), ext].join('.')
}

const getResume = async (filename?: string) =>
  JSON.parse(stripJsonComments(await readInput(filename)))

const getThemeModule = async (resume: Resume, theme?: string) => {
  const themeName = theme ?? (resume?.meta?.['theme'] as string | undefined)
  if (!themeName) {
    throw new Error(
      `No theme to use. Please specify one via the ${styleText('yellow', '--theme')} option or the ${styleText('yellow', '.meta.theme')} field of your resume.`,
    )
  }

  try {
    return (await import(themeName)) as Theme
  } catch {
    throw new Error(
      `Could not load theme ${styleText('yellow', themeName)}. Is it installed?`,
    )
  }
}

export const cli = sade(pkg.name).version(pkg.version)

cli
  .command('render [filename]', 'Render resume', { default: true })
  .option('-o, --output', 'Output filename')
  .option('-t, --theme', 'Theme to use')
  .option('--stdin', 'Read resume from stdin')
  .action(
    async (
      filename: string | undefined,
      { output, stdin, theme }: RenderOptions,
    ) => {
      const input = getInputFilename(filename, stdin)
      const outputFilename =
        output ?? getOutputFilename(input, OutputFormat.Html)
      const resume = await getResume(input)
      const themeModule = await getThemeModule(resume, theme)
      const rendered = await render(resume, themeModule)
      await writeFile(outputFilename, rendered)

      console.log(
        `You can find your rendered resume at ${styleText('yellow', outputFilename)}. Nice work! 🚀`,
      )
    },
  )

cli
  .command('export [filename]', 'Export resume to PDF')
  .option('-o, --output', 'Output filename')
  .option('-t, --theme', 'Theme to use')
  .option('--puppeteer-arg', 'Puppeteer launch argument')
  .option('--stdin', 'Read resume from stdin')
  .action(
    async (
      filename: string | undefined,
      { output, stdin, theme, ...opts }: ExportOptions,
    ) => {
      const input = getInputFilename(filename, stdin)
      const outputFilename =
        output ?? getOutputFilename(input, OutputFormat.Pdf)
      const resume = await getResume(input)
      const themeModule = await getThemeModule(resume, theme)
      const rendered = await render(resume, themeModule)
      const exported = await pdf(rendered, resume, themeModule, {
        args: [opts['puppeteer-arg'] ?? []].flat(),
      })
      await writeFile(outputFilename, exported)

      console.log(
        `You can find your exported resume at ${styleText('yellow', outputFilename)}. Nice work! 🚀`,
      )
    },
  )

cli
  .command('init [filename]', 'Create sample resume', { alias: 'create' })
  .action(async (filename: string = DEFAULT_FILENAME) => {
    await init(filename)
    console.log(
      `Done! Start editing ${styleText('yellow', filename)} now, and run the ${styleText('yellow', 'render')} command when you are ready. 👍`,
    )
  })

cli
  .command('validate [filename]', 'Validate resume')
  .option('--stdin', 'Read resume from stdin')
  .action(async (filename: string | undefined, { stdin }: RenderOptions) => {
    const input = getInputFilename(filename, stdin)
    const name = input ?? 'stdin'

    try {
      await validate(input)
      console.log(`Your ${styleText('yellow', name)} looks amazing! ✨`)
    } catch (err) {
      if (!Array.isArray(err)) {
        throw err
      }

      console.error(
        `Uh-oh! The following errors were found in ${styleText('yellow', name)}:\n`,
      )
      err.forEach((err: { message: string; path: (string | number)[] }) =>
        console.error(
          ` ${styleText('red', `❌ ${err.message}`)} at ${styleText('yellow', err.path.join('.'))}.`,
        ),
      )

      process.exitCode = 1
    }
  })
