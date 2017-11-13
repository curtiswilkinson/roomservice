import * as path from 'path'
import { child_process } from 'mz'
import { Config } from './config'

import { Options } from './index'
import Cache from './cache'

import { Spinner, buildText, resultText } from './output'

export interface Results {
  built: string[]
  cache: string[]
  error: string[]
}

const init = (config: Config, options: Options) => {
  const results: Results = { built: [], cache: [], error: [] }

  const services = Object.entries(config.service)

  const spinner = Spinner(buildText()).start()

  // Parallel build, but wait for all to finished before processing results
  Promise.all(services.map(buildService(options, results, spinner))).then(
    () => {
      // console.log(results)
      spinner.succeed(resultText(results))
    }
  )
}

const buildService = (options: any, results: Results, spinner: any) => async (
  [name, config]: any
): Promise<any> => {
  const fullPath = path.join(options.project, config.path)

  // If the cache is still valid, and the no-cache option is NOT provided, bail
  if (!options['no-cache'] && !await Cache.shouldBuild(fullPath)) {
    return results.cache.push(name)
  }

  // spawn the build process
  return child_process
    .exec(config.build, { cwd: path.join(process.cwd(), fullPath) })
    .then(() => {
      Cache.write(fullPath)
      return results.built.push(name)
    })
    .catch(error => {
      console.log(error)
      return results.error.push(name)
    })
}

export default { init }
