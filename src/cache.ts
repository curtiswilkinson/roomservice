import * as cli from 'cli'
import * as md5 from 'md5'
import * as fs from 'mz/fs'
import * as path from 'path'
import constants from './constants'

const generateCachePath = (buildPath: string): string => {
  const name = md5(path.resolve(buildPath))

  return constants.cacheBasePath + name
}

export const _shouldBuild = (getCachePath: (str: string) => string) => (
  buildPath: string
): Promise<boolean> => {
  const cachePath = getCachePath(buildPath)

  return new Promise((resolve, reject) => {
    // If there is no existing cache path, don't bother running find
    if (!fs.existsSync(cachePath)) {
      return resolve(true)
    }

    cli.exec(
      `find ${path.resolve(buildPath)} -cnewer ${cachePath}`,
      newerFiles => resolve(newerFiles[0] !== '') // find will return a single empty string upon no results
    )
  })
}

export const _write = (
  getCachePath: (str: string) => string,
  basePath = constants.cacheBasePath
) => async (buildPath: string): Promise<void> => {
  const cachePath = getCachePath(buildPath)

  // If there is no cache directory already, create that to avoid an error
  if (!fs.existsSync(basePath)) {
    await fs.mkdir(basePath)
  }

  // Write an empty string onto the file to update timestamp (or create)
  return fs.writeFile(cachePath, '')
}

export default {
  shouldBuild: _shouldBuild(generateCachePath),
  write: _write(generateCachePath)
}
