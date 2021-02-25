type Theme<T> = {
  render: (resume: object) => T | Promise<T>
}

export const render = (resume: object, theme: Theme<string>) =>
  theme.render(resume)
