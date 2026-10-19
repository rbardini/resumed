import schema from '@jsonresume/schema'
import { promisify } from 'node:util'
import { readInput } from './utils.js'

const schemaValidate = promisify(schema.validate)

export const validate = async (filename?: string) => {
  const resume = await readInput(filename)
  return schemaValidate(JSON.parse(resume))
}
