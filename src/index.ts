#!/usr/bin/env node
import * as cli from 'cli'
import Config from './config'
import Build from './build'

const main = async () => {
  const options = cli.parse({
    init: ['i', 'Initialise a default zoey configuration file', 'bool'],
    config: ['c', 'Path to the zoey configuration file', 'file', './'],
    index: [false, 'Place a project in cache to avoid an upfront full build', 'bool'],
    'no-cache': [false, 'Build all services regardless of cache status', 'bool']
  })

  if (options.init) {
    console.log('too lazy for init atm')
    return
  }

  const config = await Config.parse(options.config)

  Build.init(config, options)
}

main()
