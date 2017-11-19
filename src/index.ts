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
}

const main = async () => {
  const options: Options = cli.parse({
    init: ['i', 'Initialise a default roomservice configuration file', 'bool'],
    project: ['p', 'Path to the roomservice configuration file', 'file', './'],
    index: [
      false,
      'Place a project in cache to avoid an upfront full build',
      'bool'
    ],
    'cache-all': [
      false,
      'Forcefully cache all services, good for first installing roomservice',
      'bool'
    ],
    'no-cache': [false, 'Build all services regardless of cache status', 'bool']
  })

  if (options.init) {
    return await Init(options.project)
  }

  const parsedConfig = await Config.parse(options.project, options)
  const config = Config.normalise(parsedConfig, options)

  if (options['cache-all']) {
    return Object.keys(config.room).forEach(name => {
      Cache.write(config.room[name].path)
    })
  }

  await Build(config, options)
  process.exit(0)
}

main()
