import { readFile, writeFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import sade from 'sade'
import stripJsonComments from 'strip-json-comments'
import { red, yellow } from 'yoctocolors'
import { init, pdf, render, validate } from './index.js'
import type { Resume, Theme } from './types.js'

type RenderOptions = {
  output?: string
  theme?: string
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

const getOutputFilename = (filename: string, ext: string) =>
  [basename(filename, extname(filename)), ext].join('.')

const getResume = async (filename: string) =>
  JSON.parse(stripJsonComments(await readFile(filename, 'utf-8')))

const getThemeModule = async (resume: Resume, theme?: string) => {
  const themeName = theme ?? (resume?.meta?.['theme'] as string | undefined)
  if (!themeName) {
    throw new Error(
      `No theme to use. Please specify one via the ${yellow('--theme')} option or the ${yellow('.meta.theme')} field of your resume.`,
    )
  }

  try {
    return (await import(themeName)) as Theme
  } catch {
    throw new Error(
      `Could not load theme ${yellow(themeName)}. Is it installed?`,
    )
  }
}

export const cli = sade(pkg.name).version(pkg.version)

cli
  .command('render [filename]', 'Render resume', { default: true })
  .option('-o, --output', 'Output filename')
  .option('-t, --theme', 'Theme to use')
  .action(
    async (
      filename: string = DEFAULT_FILENAME,
      {
        output = getOutputFilename(filename, OutputFormat.Html),
        theme,
      }: RenderOptions,
    ) => {
      const resume = await getResume(filename)
      const themeModule = await getThemeModule(resume, theme)
      const rendered = await render(resume, themeModule)
      await writeFile(output, rendered)

      console.log(
        `You can find your rendered resume at ${yellow(output)}. Nice work! 🚀`,
      )
    },
  )

cli
  .command('export [filename]', 'Export resume to PDF')
  .option('-o, --output', 'Output filename')
  .option('-t, --theme', 'Theme to use')
  .action(
    async (
      filename: string = DEFAULT_FILENAME,
      {
        output = getOutputFilename(filename, OutputFormat.Pdf),
        theme,
      }: RenderOptions,
    ) => {
      const resume = await getResume(filename)
      const themeModule = await getThemeModule(resume, theme)
      const rendered = await render(resume, themeModule)
      const exported = await pdf(rendered, resume, themeModule)
      await writeFile(output, exported)

      console.log(
        `You can find your exported resume at ${yellow(output)}. Nice work! 🚀`,
      )
    },
  )

cli
  .command('init [filename]', 'Create sample resume', { alias: 'create' })
  .action(async (filename: string = DEFAULT_FILENAME) => {
    await init(filename)
    console.log(
      `Done! Start editing ${yellow(filename)} now, and run the ${yellow('render')} command when you are ready. 👍`,
    )
  })

cli
  .command('validate [filename]', 'Validate resume')
  .action(async (filename: string = DEFAULT_FILENAME) => {
    try {
      await validate(filename)
      console.log(`Your ${yellow(filename)} looks amazing! ✨`)
    } catch (err) {
      if (!Array.isArray(err)) {
        throw err
      }

      console.error(
        `Uh-oh! The following errors were found in ${yellow(filename)}:\n`,
      )
      err.forEach((err: { message: string; path: string }) =>
        console.error(` ${red(`❌ ${err.message}`)} at ${yellow(err.path)}.`),
      )

      process.exitCode = 1
    }
  })
