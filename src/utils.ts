import { readFile } from 'node:fs/promises'
import { text } from 'node:stream/consumers'

export const readInput = (filename?: string) =>
  filename == null ? text(process.stdin) : readFile(filename, 'utf-8')
