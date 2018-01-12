import * as cli from 'cli'
import * as path from 'path'
import { child_process } from 'mz'

import * as Config from './config'
import { Options } from './index'
import Queue, { Queue as QueueT } from './queue'
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
  Console.updateRows(queue.cache, Text.status.cache)

  const results: Results = { built: [], cache: queue.cache, errored: [] }

  Console.updateRows(queue.before, Text.status.before)

  // before
  await Promise.all(
    queue.before.map(runHookAsync(config, queue, results, 'before'))
  )

  // runParallel
  Console.updateRows(queue.runParallel, Text.status.runParallel)

  await Promise.all(
    queue.runParallel.map(runHookAsync(config, queue, results, 'runParallel'))
  )

  // runSychronously
  Console.updateRows(queue.runSynchronous, Text.status.queued)

  for (let name of queue.runSynchronous) {
    try {
      Console.updateRows([name], Text.status.runSynchronously)

      const room: Config.Room = config.room[name as any]
      await Room.service(room.path, room.runSync)
      pushSuccess(results, queue, name)
    } catch {
      pushError(results, name)
    }
  }

  // after
  Console.updateRows(queue.after, Text.status.after)

  await Promise.all(
    queue.after.map(runHookAsync(config, queue, results, 'after'))
  )

  // Update Caches
  results.built.forEach((name: string) => Cache.write(config.room[name].path))

  clearInterval(stopwatch)
  Console.updateRows(results.built, Text.status.finished)
  Console.updateRows(results.errored, Text.status.error)

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
  queue: QueueT,
  results: Results,
  hook: string
) => (name: string) => {
  const room: any = config.room[name]
  return Room.service(room.path, room[hook])
    .then(() => pushSuccess(results, queue, name))
    .then(() => Queue.complete(queue, hook, name))
    .catch(() => pushError(results, name))
}

const pushError = (results: Results, name: string): void => {
  results.errored.push(name)
  results.built = results.built.filter(built => name !== built)
  Console.updateRows([name], Text.status.error)
}

const pushSuccess = (results: Results, queue: QueueT, name: string): void => {
  if (!results.errored.includes(name)) {
    results.built.push(name)
    const status = Queue.find(queue, name)
      ? Text.status.waiting
      : Text.status.finished

    Console.updateRows([name], status)
  }
}
