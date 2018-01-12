const toml = require('toml')
const yaml = require('js-yaml')
import * as fs from 'mz/fs'
import * as path from 'path'
import { Options } from './index'
import Text from './text'

export interface Room {
  // LifeCycle
  runSynchronous?: string
  before?: string
  runParallel?: string
  after?: string
  finally?: string

  // Other
  path: string
}

export interface Config {
  rooms: {
    [index: string]: Room
  }
}

const findConfig = (fileNames: string[]) => {
  const validConfigNames = ['toml', 'yaml', 'yml', 'json'].map(
    ext => 'roomservice.config.' + ext
  )

  const matches = fileNames.filter(name => validConfigNames.includes(name))
  if (!matches.length) {
    throw new Error()
  }

  return matches[0]
}

export const buildPath = async (configPath: string) => {
  const isFile = await fs.lstat(configPath).then(stats => stats.isFile())

  if (isFile) {
    return configPath
  }

  return fs
    .readdir(configPath)
    .then(findConfig)
    .then(name => path.join(configPath, name))
}

export const parse = (configPath: string) => (contents: Buffer) => {
  const parsers: any = {
    '.toml': toml.parse,
    '.json': JSON.parse,
    '.yaml': yaml.load,
    '.yml': yaml.load
  }

  const ext = path.extname(configPath)

  if (!parsers[ext]) {
    throw new Error()
  }

  return parsers[ext](contents)
}

export const readConfig = (configPath: string): Promise<any> => {
  return fs.readFile(configPath).then(parse(configPath))
}
export const get = (configPath: string): Promise<any> =>
  buildPath(configPath)
    .then(readConfig)
    .catch(error => {
      console.log(Text.noConfig)
      process.exit(1)
    })

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
  const normalisedRooms = Object.keys(config.rooms).reduce(
    (acc: { [index: string]: Room }, roomName) => {
      const room = config.rooms[roomName]
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
    rooms: normalisedRooms
  }
}

export default { get, normalise }
