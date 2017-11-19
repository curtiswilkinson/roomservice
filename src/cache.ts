import { child_process } from 'mz'
import * as md5 from 'md5'
import * as fs from 'mz/fs'
import * as path from 'path'
import constants from './constants'

const generateCachePath = (buildPath: string): string => {
  const name = md5(buildPath)

  return constants.cacheBasePath + name
}

export const _shouldBuild = (getCachePath: (str: string) => string) => async (
  buildPath: string
): Promise<boolean> => {
  const cachePath = getCachePath(buildPath)

  // If there is no existing cache path, don't bother running find
  if (!fs.existsSync(cachePath)) {
    return true
  }

  return child_process
    .exec(`find ${buildPath} -cnewer ${cachePath}`)
    .then((thing: any) => {
      return thing[0] !== ''
    })
    .catch(e => {
      return true
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
