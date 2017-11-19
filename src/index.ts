#!/usr/bin/env node
import * as cli from 'cli'
import Config from './config'
import Build from './build'
import Init from './init'

export interface Options {
  init?: boolean
  project?: string
  index?: boolean
  verbose?: boolean
  'no-cache'?: boolean
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
    'no-cache': [false, 'Build all services regardless of cache status', 'bool']
  })

  if (options.init) {
    return Init(options.project)
  }

  const parsedConfig = await Config.parse(options.project, options)
  const config = Config.normalise(parsedConfig, options)

  await Build(config, options)
  process.exit(1)
}

main()
