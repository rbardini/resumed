import { expect, it, vi } from 'vitest'
import { render } from '../src/render'

it('renders a theme', () => {
  const resume = require('resume-schema/sample.resume.json')
  const theme = {
    render: vi.fn(({ basics: { name } }) => name),
  }

  expect(render(resume, theme)).toBe(resume.basics.name)
})
