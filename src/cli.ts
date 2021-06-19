#!/usr/bin/env node
import { promises as fs } from 'fs'
import { red, yellow } from 'colorette'
import sade from 'sade'
import { init, loadThemes, render, validate } from '.'

const pkg = require('../package.json')

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
  .option('-t, --theme', 'Theme to use, if more than one is installed')
  .action(
    async (
      filename: string = 'resume.json',
      { output, theme }: RenderOptions,
    ) => {
      const resume = JSON.parse(await fs.readFile(filename, 'utf-8'))
      const [loadedTheme, ...otherLoadedThemes] = await loadThemes(theme)

      if (loadedTheme == null) {
        console.log(
          `Could not find a JSON Resume theme to render. Try installing one (e.g. ${yellow(
            'npm i jsonresume-theme-even',
          )}) and run the command again. 😉`,
        )

        process.exitCode = 1
        return
      }

      if (otherLoadedThemes.length > 0) {
        console.log(
          `Found ${
            otherLoadedThemes.length + 1
          } JSON Resume themes installed, defaulting to ${yellow(
            loadedTheme.name,
          )}. Pass the ${yellow(
            '--theme',
          )} option if you would like to use another one.`,
        )
      }

      const rendered = await render(resume, loadedTheme.module)
      await fs.writeFile(output, rendered)

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

      console.log(
        `Uh-oh! The following errors were found in ${yellow(filename)}:\n`,
      )
      err.forEach((err: { message: string; path: string }) =>
        console.log(` ${red(`❌ ${err.message}`)} at ${yellow(err.path)}.`),
      )

      process.exitCode = 1
    }
  })
