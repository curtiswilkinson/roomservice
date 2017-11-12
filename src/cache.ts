import * as cli from 'cli'
import * as md5 from 'md5'
import * as fs from 'mz/fs'
import * as path from 'path'
import constants from './constants'

const generateCachePath = (buildPath: string): string => {
  const name = md5(path.resolve(buildPath))

  return constants.cacheBasePath + name
}

const shouldBuild = (buildPath: string): Promise<boolean> => {
  const cachePath = generateCachePath(buildPath)

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

const write = async (buildPath: string): Promise<void> => {
  const cachePath = generateCachePath(buildPath)

  // If there is no cache directory already, create that to avoid an error
  if (!fs.existsSync(constants.cacheBasePath)) {
    await fs.mkdir(constants.cacheBasePath)
  }

  // Write an empty string onto the file to update timestamp (or create)
  return fs.writeFile(cachePath, '')
}

export default { shouldBuild, write }
