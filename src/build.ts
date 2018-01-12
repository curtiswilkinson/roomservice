import * as cli from 'cli'
import * as path from 'path'
import { child_process } from 'mz'

import * as Config from './config'
import { Options } from './index'
import Queue, { Queue as QueueT } from './queue'
import Cache from './cache'
import Room from './room'
import Version from './version'

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

  await Version.validate()

  const queue = await Queue.build(config, options)

  Console.startBuild(Object.keys(config.rooms))
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
      Console.updateRows([name], Text.status.runSynchronous)

      const room: Config.Room = config.rooms[name as any]
      await Room.service(room.path, room.runSynchronous)
      pushSuccess(results, queue, 'runSynchronous', name)
    } catch {
      pushError(results, name)
    }
  }

  // after
  Console.updateRows(queue.after, Text.status.after)

  await Promise.all(
    queue.after.map(runHookAsync(config, queue, results, 'after'))
  )

  // finally
  Console.updateRows(queue.finally, Text.status.finally)

  await Promise.all(
    queue.finally.map(runHookAsync(config, queue, results, 'finally'))
  )

  // Update Caches
  results.built.forEach((name: string) => Cache.write(config.rooms[name].path))

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
  const room: any = config.rooms[name]
  return Room.service(room.path, room[hook])
    .then(() => pushSuccess(results, queue, hook, name))
    .catch(() => pushError(results, name))
}

const pushError = (results: Results, name: string): void => {
  results.errored.push(name)
  results.built = results.built.filter(built => name !== built)
  Console.updateRows([name], Text.status.error)
}

export const pushSuccess = (
  results: Results,
  queue: QueueT,
  hook: string,
  name: string
): string | void => {
  Queue.complete(queue, hook, name)
  if (!results.errored.includes(name)) {
    results.built.push(name)
    const status = Queue.roomFinished(queue, hook, name)
      ? Text.status.finished
      : Text.status.waiting

    Console.updateRows([name], status)

    return status
  }
}
