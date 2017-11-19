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

const build = async (config: Config, options: Options): Promise<Queue> => {
	const roomNames = Object.keys(config.room)

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

			if (!options['no-cache'] && !await Cache.shouldBuild(room.path)) {
				queue.cache.push(name)
			} else {
				for (const hook in room) {
					const hookQueue = (queue as any)[hook]
					if (hookQueue) {
						hookQueue.push(name)
					}
				}
			}
		})
	)

	return queue
}

export default { build }
