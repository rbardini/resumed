import { writeFile } from 'node:fs/promises'

export const init = (filename: string) => {
  const resume = require('resume-schema/sample.resume.json')
  return writeFile(filename, JSON.stringify(resume, undefined, 2))
}
