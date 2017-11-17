import * as path from 'path'
import { child_process } from 'mz'
import { Config, Room } from './config'
import { Options } from './index'
import Cache from './cache'

import Service from './service'

import { Spinner, buildText, resultText } from './output'

interface Queue {
  run: string[]
  beforeService: string[]
  runSync: string[]
  afterService: string[]
}

const init = async (config: Config, options: Options) => {
  const queue = buildQueue(config, options)
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

  spinner.succeed(resultText(result))
  process.exit(1)
}

const buildQueue = (config: Config, options: Options): Queue => {
  const roomNames = Object.keys(config.room)

  return roomNames.reduce(
    (queue: Queue, name: any) => {
      const room: Room = config.room[name] as Room

      if (options['no-cache'] || Cache.shouldBuild(room.path)) {
        if (room.run) {
          queue.run.push(name)
        }
        if (room.beforeService) {
          queue.beforeService.push(name)
        }
        if (room.runSync) {
          queue.runSync.push(name)
        }
        if (room.afterService) {
          queue.afterService.push(name)
        }
      }
      return queue
    },
    {
      run: [],
      beforeService: [],
      runSync: [],
      afterService: []
    }
  )
}

export default { init }
