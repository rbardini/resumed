// Based on https://github.com/prettier/prettier/blob/master/src/common/load-plugins.js
import { promises as fs } from 'fs'
import path from 'path'
import escalade from 'escalade'
import globby from 'globby'
import uniqBy from 'lodash.uniqby'

const isDir = async (dir: string) => {
  try {
    return (await fs.stat(dir)).isDirectory()
  } catch {
    return false
  }
}

const findThemesInNodeModules = async (theme = '*', nodeModulesDir: string) =>
  (
    await globby(
      [
        `jsonresume-theme-${theme}/package.json`,
        `@*/jsonresume-theme-${theme}/package.json`,
        `@jsonresume/theme-${theme}/package.json`,
      ],
      { cwd: nodeModulesDir, expandDirectories: false },
    )
  ).map(path.dirname)

export const loadThemes = async (theme?: string) => {
  const themeSearchDir = await escalade(
    process.cwd(),
    (_dir, names) => names.includes('node_modules') && '.',
  )

  if (!themeSearchDir) {
    throw new Error('node_modules directory not found')
  }

  const nodeModulesDir = path.resolve(themeSearchDir, 'node_modules')

  // In some fringe cases (e.g. files "mounted" as virtual directories),
  // the isDir(themeSearchDir) check might be false even though node_modules
  // actually exists.
  if (!(await isDir(nodeModulesDir)) && !(await isDir(themeSearchDir))) {
    throw new Error(`${themeSearchDir} does not exist or is not a directory`)
  }

  const themesInfo = (await findThemesInNodeModules(theme, nodeModulesDir)).map(
    name => ({
      name: name.split('-').pop()!,
      path: require.resolve(name, { paths: [themeSearchDir] }),
    }),
  )

  return uniqBy(themesInfo, 'path').map(info => ({
    ...info,
    module: require(info.path),
  }))
}
