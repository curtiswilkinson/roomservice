import * as cli from 'cli'
import { Config } from './config'
import Cache from './cache'
import * as path from 'path'

const init = (config: Config, options) => {
  Object.entries(config.service).forEach(async ([name, config]) => {
    const fullPath = path.join(options.config, config.path)
    const shouldBuild = await Cache.shouldBuildService(fullPath)

    if (shouldBuild) {
      console.log('I"M BUILDING ' + name)
      cli.exec(config.build, lines => {
        Cache.write(fullPath)
      })
    }
  })
}

export default { init }
