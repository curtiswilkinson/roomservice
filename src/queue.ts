import Cache from './cache'
import { Config, Room } from './config'
import { Options } from './index'

interface Queue {
	run: string[]
	beforeService: string[]
	runSync: string[]
	afterService: string[]
}

const build = (config: Config, options: Options): Queue => {
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

export default { build }
