import * as cli from 'cli'
import * as md5 from 'md5'
import * as fs from 'mz/fs'
import * as path from 'path'

const generateCachePath = (buildPath: string): string => {
  const name = md5(path.resolve(buildPath))

  return `${process.env.HOME}/zoey/${name}`
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

  if (!fs.existsSync(process.env.HOME + '/zoey/')) {
    await fs.mkdir(process.env.HOME + '/zoey/')
  }
  return fs.writeFile(cachePath, '')
}

export default { shouldBuildService, write }
