import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import * as schema from 'resume-schema'

const schemaValidate = promisify(schema.validate)

export const validate = async (filename: string) => {
  const resume = await readFile(filename, 'utf-8')
  return schemaValidate(JSON.parse(resume))
}
