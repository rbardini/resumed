import { readFile, writeFile } from 'node:fs/promises'
import sade from 'sade'
import { red, yellow } from 'yoctocolors'
import { init, render, validate } from './index.js'

// Trick Rollup into not bundling package.json
const pkgPath = '../package.json'
const pkg = JSON.parse(
  await readFile(new URL(pkgPath, import.meta.url), 'utf-8'),
)

type RenderOptions = {
  output: string
  theme?: string
}

export const cli = sade(pkg.name).version(pkg.version)

cli
  .command('render [filename]', 'Render resume', {
    alias: 'export',
    default: true,
  })
  .option('-o, --output', 'Output filename', 'resume.html')
  .option('-t, --theme', 'Theme to use')
  .action(
    async (
      filename: string = 'resume.json',
      { output, theme }: RenderOptions,
    ) => {
      const resume = JSON.parse(await readFile(filename, 'utf-8'))

      const themeName = theme ?? resume?.meta?.theme
      if (!themeName) {
        console.error(
          `No theme to use. Please specify one via the ${yellow(
            '--theme',
          )} option or the ${yellow('.meta.theme')} field of your resume.`,
        )

        process.exitCode = 1
        return
      }

      let themeModule
      try {
        themeModule = await import(themeName)
      } catch {
        console.error(
          `Could not load theme ${yellow(themeName)}. Is it installed?`,
        )

        process.exitCode = 1
        return
      }

      const rendered = await render(resume, themeModule)
      await writeFile(output, rendered)

      console.log(
        `You can find your rendered resume at ${yellow(output)}. Nice work! 🚀`,
      )
    },
  )

cli
  .command('init [filename]', 'Create sample resume', { alias: 'create' })
  .action(async (filename: string = 'resume.json') => {
    await init(filename)
    console.log(
      `Done! Start editing ${yellow(filename)} now, and run the ${yellow(
        'render',
      )} command when you are ready. 👍`,
    )
  })

cli
  .command('validate [filename]', 'Validate resume')
  .action(async (filename: string = 'resume.json') => {
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
