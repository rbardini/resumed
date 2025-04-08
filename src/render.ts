import type { Resume, Theme } from './types.js'

export const render = (resume: Resume, theme: Theme) => theme.render(resume)
