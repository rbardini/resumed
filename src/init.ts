import { promises as fs } from 'fs'

export const init = (filename: string) => {
  const resume = require('resume-schema/sample.resume.json')
  return fs.writeFile(filename, JSON.stringify(resume, undefined, 2))
}
