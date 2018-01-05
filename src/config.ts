const toml = require('toml')
import * as fs from 'mz/fs'
import * as path from 'path'
import { Options } from './index'
import Text from './text'

export interface Room {
  // LifeCycle
  run?: string
  beforeService?: string
  runSync?: string
  afterService?: string

  // Other
  path: string
}

export interface Config {
  room: {
    [index: string]: Room
  }
}

export const buildPath = (configPath: string) =>
  fs
    .lstat(configPath)
    .then(
      stats =>
        stats.isFile()
          ? configPath
          : path.join(configPath, 'roomservice.config.toml')
    )

export const readConfig = (configPath: string): Promise<any> =>
  fs
    .readFile(configPath)
    .then(toml.parse)
    .catch(error => {
      if (error.code === 'ENOENT') {
        console.log(Text.noConfig)
      } else {
        console.log(error)
      }
      process.exit(1)
    })

export const parse = (configPath: string, options: Options): Promise<any> =>
  buildPath(configPath).then(readConfig)

export const findProjectRoot = (projectPath: string) => {
  if (!projectPath) {
    return
  }

  return fs
    .lstat(projectPath)
    .then(stats => (stats.isFile() ? path.dirname(projectPath) : projectPath))
}

export const normalise = async (
  config: Config,
  options: Options
): Promise<Config> => {
  const projectRoot = await findProjectRoot(options.project)
  const normalisedRooms = Object.keys(config.room).reduce(
    (acc: { [index: string]: Room }, roomName) => {
      const room = config.room[roomName]
      acc[roomName] = {
        ...room,
        path: path.resolve(path.join(projectRoot || '', room.path))
      }
      return acc
    },
    {}
  )

  return {
    ...config,
    room: normalisedRooms
  }
}

export default { parse, normalise }
