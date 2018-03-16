import * as cli from 'cli'
import * as path from 'path'
import { child_process, fs } from 'mz'

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
  errored: [string, Error][]
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
    } catch (e) {
      pushError(results, name, e)
    }
  }

  // after
  Console.updateRows(queue.after, Text.status.after)

  await Promise.all(
    queue.after.map(runHookAsync(config, queue, results, 'after'))
  )

  // finally
  Console.updateRows(queue.finally, Text.status.finally)

  if (!options['no-finally']) {
    await Promise.all(
      queue.finally.map(runHookAsync(config, queue, results, 'finally'))
    )
  }

  // Update Caches
  results.built.forEach((name: string) => Cache.write(config.rooms[name].path))

  clearInterval(stopwatch)
  Console.updateRows(results.built, Text.status.finished)
  Console.updateRows(results.errored.map(([name]) => name), Text.status.error)

  console.log(await Text.doneWithTime(timer))

  if (results.cache.length) {
    console.log(Text.cache)
  }

  if (results.errored.length) {
    await fs.writeFile(
      path.join(options.project || './', 'roomservice-error.log'),
      results.errored
        .map(([name, error]) => 'Error in room => ' + name + '\n' + error)
        .join('\n\n')
    )
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
    .catch(error => pushError(results, name, error))
}

const pushError = (results: Results, name: string, error: Error): void => {
  results.errored.push([name, error])
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
  if (!results.errored.map(([name]) => name).includes(name)) {
    results.built.push(name)
    const status = Queue.roomFinished(queue, hook, name)
      ? Text.status.finished
      : Text.status.waiting

    Console.updateRows([name], status)

    return status
  }
}
