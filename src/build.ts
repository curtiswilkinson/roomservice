import * as cli from 'cli'
import * as path from 'path'
import * as chalk from 'chalk'
import { child_process } from 'mz'

import * as Config from './config'
import { Options } from './index'
import Queue from './queue'
import Cache from './cache'
import Room from './room'

import { Spinner, buildText, resultText, calculatingText } from './output'

interface Results {
  built: string[]
  cache: string[]
  errored: string[]
}

export default async (config: Config.Config, options: Options) => {
  console.log(calculatingText)
  let timer = 0
  const stopwatch = setInterval(() => timer++, 1000)

  const queue = await Queue.build(config, options)

  const spinner = Spinner(buildText(queue))

  const results: Results = { built: [], cache: queue.cache, errored: [] }

  // run
  Promise.all(queue.run.map(runHookAsync(config, results, 'run')))

  spinner.text = chalk.bold('Running beforeService...')

  // beforeService
  await Promise.all(
    queue.beforeService.map(runHookAsync(config, results, 'beforeService'))
  )

  // runSync
  for (let name of queue.runSync) {
    try {
      spinner.text = chalk.bold('Running ' + name + ':runSync...')

      const room: Config.Room = config.room[name as any]
      await Room.service(name, room.path, room.runSync)
      pushSuccess(results, name)
    } catch {
      pushError(results, name)
    }
  }

  spinner.text = chalk.bold('Running afterService...')

  // afterService
  await Promise.all(
    queue.afterService.map(runHookAsync(config, results, 'afterService'))
  )

  // Update Caches
  results.built.forEach((name: string) => Cache.write(config.room[name].path))

  clearInterval(stopwatch)
  return spinner.succeed(resultText(results, timer))
}

const runHookAsync = (
  config: Config.Config,
  results: Results,
  hook: string
) => (name: string) => {
  const room: any = config.room[name]
  return Room.service(name, room.path, room[hook])
    .then(() => pushSuccess(results, name))
    .catch(() => pushError(results, name))
}

const pushError = (results: Results, name: string): void => {
  results.errored.push(name)
  results.built = results.built.filter(built => name !== built)
}

const pushSuccess = (results: Results, name: string): void => {
  if (!results.errored.includes(name)) {
    results.built.push(name)
  }
}
