import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

// ESM can't import JSON yet, fallback to `require`
const require = createRequire(import.meta.url)

export const init = (filename: string) => {
  const resume = require('@jsonresume/schema/sample.resume.json')
  return writeFile(filename, JSON.stringify(resume, undefined, 2))
}
