import { readFile, writeFile } from 'node:fs/promises'
import { red, yellow } from 'yoctocolors'
import sade from 'sade'
import { init, render, validate } from './index.js'

import express from 'express'
import livereload from 'livereload'
import connectLiveReload from 'connect-livereload'

import chokidar from 'chokidar'

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

cli
  .command('serve [filename]', 'Serve resume')
  .option('-t, --theme', 'Theme to use')
  .option('-p, --port', 'Port to use', 3000)
  .action(
    async (
      filename: string = 'resume.json',
      port: number = 3000,
      theme: string,
    ) => {
      const app = express()
      app.use(connectLiveReload())

      const liveReloadServer = livereload.createServer({
        extraExts: ['json'],
        debug: true,
      })
      liveReloadServer.watch(filename)

      app.get('/', async (_, res) => {
        const resume = JSON.parse(await readFile(filename, 'utf-8'))
        const themeName = theme ?? resume?.meta?.theme
        if (!themeName) {
          console.error(
            `No theme to use. Please specify one via the ${yellow(
              '--theme',
            )} option or the ${yellow('.meta.theme')} field of your resume.`,
          )
          const msg = `No theme to use. Please restart the server with the '--theme' option or set the '.meta.theme' field of your resume.`
          res.send(
            `<html><head><title>Error</title><body><pre>${msg}</pre></body></html>`,
          )
          return
        }

        let themeModule
        try {
          themeModule = await import(themeName)
        } catch {
          console.error(
            `Could not load theme ${yellow(themeName)}. Is it installed?`,
          )

          const msg = `Could not load theme ${themeName}. Is it installed?`
          res.send(
            `<html><head><title>Error</title><body><pre>${msg}</pre></body></html>`,
          )
          return
        }

        res.send(await render(resume, themeModule))
      })

      app.listen(port, () => {
        console.log(`Resume available at http://0.0.0.0:${port}/`)
      })
    },
  )

cli
  .command('watch [filename]', 'Watch for changes and render resume')
  .option('-o, --output', 'Output filename', 'resume.html')
  .option('-t, --theme', 'Theme to use')
  .action(
    async (
      filename: string = 'resume.json',
      { output, theme }: RenderOptions,
    ) => {
      chokidar
        .watch(filename)
        .on('ready', async () => {
          console.log(`Watching for changes to ${yellow(filename)}...`)
        })
        .on('change', async () => {
          const resume = JSON.parse(await readFile(filename, 'utf-8'))
          const themeName = theme ?? resume?.meta?.theme
          if (!themeName) {
            console.error(
              `No theme to use. Please specify one via the ${yellow(
                '--theme',
              )} option or the ${yellow('.meta.theme')} field of your resume.`,
            )
            return
          }

          let themeModule
          try {
            themeModule = await import(themeName)
          } catch {
            console.error(
              `Could not load theme ${yellow(themeName)}. Is it installed?`,
            )
            return
          }

          const rendered = await render(resume, themeModule)
          await writeFile(output, rendered)

          console.log(
            `${yellow(filename)} updated, re-rendered to ${yellow(output)}.`,
          )
        })
    },
  )
