#!/usr/bin/env node
import * as cli from 'cli'
import Config from './config'
import Build from './build'
import Init from './init'
import Cache from './cache'

export interface Options {
  init?: boolean
  project?: string
  index?: boolean
  'no-cache'?: boolean
  'cache-all'?: boolean
  ignore?: boolean
}

const main = async () => {
  const options: Options = cli.parse({
    init: ['i', 'Initialise a default roomservice configuration file', 'bool'],
    project: [
      'p',
      'Path to the roomservice configuration file, or a directory with the config inside',
      'file',
      './'
    ],
    'cache-all': [false, 'Forcefully cache all services', 'bool'],
    'no-cache': [
      false,
      'Build all services regardless of cache status',
      'bool'
    ],
    ignore: [
      false,
      'A list of rooms that will not be ignored by the build',
      'bool'
    ]
  })

  if (options.init) {
    return await Init(options.project)
  }

  const parsedConfig = await Config.get(options.project)
  const config = await Config.normalise(parsedConfig, options)

  if (options['cache-all']) {
    return Object.keys(config.rooms).forEach(name => {
      Cache.write(config.rooms[name].path)
    })
  }

  await Build(config, options)
  process.exit(0)
}

main()
