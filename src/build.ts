import { child_process } from 'mz'
import { Config } from './config'
import Cache from './cache'
import * as path from 'path'

interface Results {
  built: string[]
  cache: string[]
  error: string[]
}

const init = (config: Config, options: any) => {
  const results: Results = { built: [], cache: [], error: [] }

  const services = Object.entries(config.service)

  // Parallel build, but wait for all to finished before processing results
  Promise.all(services.map(buildService(options, results))).then(() => {
    console.log(results)
  })
}

const buildService = (options: any, results: Results) => async (
  [name, config]: any
): Promise<any> => {
  const fullPath = path.join(options.config, config.path)

  // If the cache is still valid, and the no-cache option is NOT provided, bail
  if (options['no-cache'] && !await Cache.shouldBuild(fullPath)) {
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
      return results.error.push(name)
    })
}

export default { init }
