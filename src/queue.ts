import Cache from './cache'
import { Config, Room } from './config'
import { Options } from './index'

export interface Queue {
	run: string[]
	beforeService: string[]
	runSync: string[]
	afterService: string[]
	cache: string[]
}

const _build = (processArgs: string[]) => async (config: Config, options: Options): Promise<Queue> => {
  let roomNames = Object.keys(config.room)

  if (options.ignore) {
    roomNames = roomNames.filter(name => !processArgs.includes(name))
  }

	const queue: Queue = {
		run: [],
		beforeService: [],
		runSync: [],
		afterService: [],
    cache: []
	}

	await Promise.all(
		roomNames.map(async (name: string) => {
			const room: Room = config.room[name] as Room

			// If no --no-cache flag, and the cache is still valid
			// Note to keep the flag check first, this saves checking cache validity if they've opted out
			if (!options['no-cache'] && !await Cache.shouldBuild(room.path)) {
				queue.cache.push(name)
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

export default { build, _build }
