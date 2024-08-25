import { expect, it, vi } from 'vitest'
import { render } from '../src/render.js'

it('renders a theme', () => {
  const resume = require('@jsonresume/schema/sample.resume.json')
  const theme = {
    render: vi.fn(({ basics: { name } }) => name),
  }

  expect(render(resume, theme)).toBe(resume.basics.name)
})
