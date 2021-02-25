beforeEach(() => jest.resetModules())

it('loads installed themes', async () => {
  const { loadThemes } = await import('../src/load-themes')

  await expect(loadThemes()).resolves.toStrictEqual([
    {
      module: expect.objectContaining({
        render: expect.any(Function),
      }),
      name: 'even',
      path: expect.stringContaining('/node_modules/jsonresume-theme-even/'),
    },
  ])
})

it('loads specific installed theme', async () => {
  const { loadThemes } = await import('../src/load-themes')

  await expect(loadThemes('even')).resolves.toStrictEqual([
    {
      module: expect.objectContaining({
        render: expect.any(Function),
      }),
      name: 'even',
      path: expect.stringContaining('/node_modules/jsonresume-theme-even/'),
    },
  ])
})

it('loads nothing if specific theme not installed', async () => {
  const { loadThemes } = await import('../src/load-themes')

  await expect(loadThemes('flat')).resolves.toStrictEqual([])
})

it('throws if node_modules directory not found', async () => {
  jest.doMock('escalade', () => jest.fn().mockResolvedValue(undefined))

  const { loadThemes } = await import('../src/load-themes')

  await expect(loadThemes()).rejects.toThrow('node_modules directory not found')
})

it('throws if node_modules is not a directory', async () => {
  jest.doMock('escalade', () => jest.fn().mockResolvedValue('/node_modules'))

  const { loadThemes } = await import('../src/load-themes')

  await expect(loadThemes()).rejects.toThrow(
    '/node_modules does not exist or is not a directory',
  )
})
