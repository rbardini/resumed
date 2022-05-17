import { promises as fs } from 'fs'
import * as theme from 'jsonresume-theme-even'
import { render } from 'resumed'

const resume = JSON.parse(await fs.readFile('resume.json', 'utf-8'))
const html = await render(resume, theme)

await fs.writeFile('resume.html', html)
