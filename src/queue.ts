import Cache from './cache'
import { Config, Room } from './config'
import { Options } from './index'

export interface Queue {
  runParallel: string[]
  before: string[]
  runSynchronous: string[]
  after: string[]
  finally: string[]
  cache: string[]
}

const _build = (processArgs: string[]) => async (
  config: Config,
  options: Options
): Promise<Queue> => {
  let roomNames = Object.keys(config.rooms)

  if (options.ignore) {
    roomNames = roomNames.filter(name => !processArgs.includes(name))
  }

  const queue: Queue = {
    runParallel: [],
    before: [],
    runSynchronous: [],
    after: [],
    finally: [],
    cache: []
  }

  await Promise.all(
    roomNames.map(async (name: string) => {
      const room: Room = config.rooms[name] as Room

      // If no --no-cache flag, and the cache is still valid
      // Note to keep the flag check first, this saves checking cache validity if they've opted out
      if (!options['no-cache'] && !await Cache.shouldBuild(room.path)) {
        queue.cache.push(name)
        if (room.finally) {
          queue.finally.push(name)
        }
      } else {
        // loop over the room config
        for (const hook in room) {
          const hookQueue = (queue as any)[hook]
          // if there the key is a queue key, throw the room in
          if (hookQueue) {
            hookQueue.push(name)
          }
        }
      }
    })
  )

  return queue
}

const build = _build(process.argv)

const roomFinished = (
  queue: Queue,
  hook: string,
  roomName: string
): boolean => {
  const allQueuedRooms = Object.values(queue).reduce((acc, currentHook) => {
    if (hook !== currentHook) {
      acc = acc.concat(currentHook)
    }
    return acc
  }, [])

  return !allQueuedRooms.includes(roomName)
}

const complete = (queue: any, hook: string, room: string) => {
  queue[hook] = queue[hook].filter((name: string) => name !== room)
}

export default { build, _build, roomFinished, complete }
