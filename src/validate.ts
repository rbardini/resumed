import { promises as fs } from 'fs'
import schema from 'resume-schema'
import { promisify } from 'util'

const schemaValidate = promisify(schema.validate)

export const validate = async (filename: string) => {
  const resume = await fs.readFile(filename, 'utf-8')
  return schemaValidate(JSON.parse(resume))
}
