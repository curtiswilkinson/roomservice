#!/usr/bin/env node
import * as cli from 'cli'
import Config from './config'
import Build from './build'

const main = async () => {
  const options = cli.parse({
    config: ['c', 'Path to the zoey configuration file', 'file', './']
  })

  if (process.argv.includes('init')) {
    console.log('too lazy for init atm')
  }

  const config = await Config.parse(options.config)

  Build.init(config, options)
}

main()
