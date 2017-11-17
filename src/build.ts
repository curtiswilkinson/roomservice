import * as path from 'path'
import { child_process } from 'mz'
import { Config, Room } from './config'
import { Options } from './index'

import Queue from './queue'
import Cache from './cache'
import Service from './service'

import { Spinner, buildText, resultText } from './output'

export default async (config: Config, options: Options) => {
  const queue = Queue.build(config, options)
  const spinner = Spinner(buildText(queue))

  const result: any = { built: [], cache: [], errored: [] }

  // run
  queue.run.forEach(name => {
    const room: Room = config.room[name as any]
    Service.run(options, name, room.path, room.run)
      .then(() => result.built.push(name))
      .catch(result.errored.push(name))
  })

  // beforeService
  await Promise.all(
    queue.beforeService.map(name => {
      const room: Room = config.room[name as any]
      return Service.run(options, name, room.path, room.beforeService)
        .then(() => result.built.push(name))
        .catch(result.errored.push(name))
    })
  )

  // runSync
  for (let name of queue.runSync) {
    try {
      const room: Room = config.room[name as any]
      await Service.run(options, name, room.path, room.runSync)
      result.built.push(name)
    } catch {
      result.errored.push(name)
    }
  }

  // afterService
  await Promise.all(
    queue.afterService.map(name => {
      const room: Room = config.room[name as any]
      return Service.run(options, name, room.path, room.afterService)
        .then(() => result.built.push(name))
        .catch(() => result.errored.push(name))
    })
  )

  return spinner.succeed(resultText(result))
}
