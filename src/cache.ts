import * as cli from 'cli'
import * as md5 from 'md5'
import * as fs from 'mz/fs'
import * as path from 'path'
import constants from './constants'

const generateCachePath = (buildPath: string): string => {
  const name = md5(path.resolve(buildPath))

  return constants.cacheBasePath + name
}

const shouldBuildService = (buildPath: string): Promise<boolean> => {
  const cachePath = generateCachePath(buildPath)

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(cachePath)) {
      return resolve(true)
    }

    cli.exec(
      `find ${path.resolve(buildPath)} -cnewer ${cachePath}`,
      newerFiles => resolve(newerFiles[0] !== '')
    )
  })
}

const write = async (buildPath: string): Promise<void> => {
  const cachePath = generateCachePath(buildPath)

  if (!fs.existsSync(constants.cacheBasePath)) {
    await fs.mkdir(constants.cacheBasePath)
  }
  return fs.writeFile(cachePath, '')
}

export default { shouldBuildService, write }
