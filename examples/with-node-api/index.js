const { promises: fs } = require('fs')
const theme = require('jsonresume-theme-even')
const { render } = require('resumed')

;(async () => {
  const resume = JSON.parse(await fs.readFile('resume.json', 'utf-8'))
  const html = await render(resume, theme)

  await fs.writeFile('resume.html', html)
})()
