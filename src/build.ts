import * as cli from 'cli'
import * as path from 'path'
import * as chalk from 'chalk'
import { child_process } from 'mz'

import * as Config from './config'
import { Options } from './index'
import Queue from './queue'
import Cache from './cache'
import Room from './room'

import Console from './console'
import Text from './text'

interface Results {
  built: string[]
  cache: string[]
  errored: string[]
}

export default async (config: Config.Config, options: Options) => {
  console.log(Text.calculating)
  let timer = 0
  const stopwatch = setInterval(() => timer++, 1000)

  const queue = await Queue.build(config, options)

  Console.startBuild(Object.keys(config.room))
  Console.updateRows(queue.cache, chalk.cyan.bold('No Change'))

  const results: Results = { built: [], cache: queue.cache, errored: [] }

  // run
  Promise.all(queue.run.map(runHookAsync(config, results, 'run')))

  Console.updateRows(queue.beforeService, chalk.green.bold('Running beforeService...'))

  // beforeService
  await Promise.all(
    queue.beforeService.map(runHookAsync(config, results, 'beforeService'))
  )

  Console.updateRows(queue.runSync, chalk.bold.yellow('In Queue'))

  // runSync
  for (let name of queue.runSync) {
    try {
      Console.updateRows([name], chalk.bold.green('Running runSync...'))

      const room: Config.Room = config.room[name as any]
      await Room.service(name, room.path, room.runSync)
      pushSuccess(results, name)
    } catch {
      pushError(results, name)
    }
  }

  Console.updateRows(
    queue.afterService,
    chalk.bold.green('Running afterService...')
  )

  // afterService
  await Promise.all(
    queue.afterService.map(runHookAsync(config, results, 'afterService'))
  )

  // Update Caches
  results.built.forEach((name: string) => Cache.write(config.room[name].path))

  clearInterval(stopwatch)
  Console.updateRows(results.built, chalk.bold.green('Finished'))
  Console.updateRows(results.errored, chalk.bold.red('Errored'))

  console.log(Text.doneWithTime(timer))

  if (results.cache.length) {
    console.log(Text.cache)
  }

  if (results.errored.length) {
    console.log(Text.error)
  }

  return
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
  Console.updateRows([name], chalk.red.bold('Errored'))
}

const pushSuccess = (results: Results, name: string): void => {
  if (!results.errored.includes(name)) {
    results.built.push(name)
    Console.updateRows([name], chalk.green.bold('Waiting...'))
  }
}
