const toml = require('toml')
import * as fs from 'mz/fs'
import * as path from 'path'
import { Options } from './index'
import { noConfigText } from './output'

export interface Room {
	// LifeCycle
	run?: string
	beforeService?: string
	runSync?: string
	afterService?: string

	// Other
	path: string
}

export interface Config {
	room: {
		[index: string]: Room
	}
}

const parse = (roomPath: string, options: Options): Promise<any> =>
	fs
		.readFile(path.join(roomPath, 'roomservice.config.toml'))
		.then(toml.parse)
		.catch(error => {
			if (error.code === 'ENOENT') {
				console.log(noConfigText)
			} else {
				console.log(error)
			}
			process.exit(1)
		})

const normalise = (config: Config, options: Options): Config => {
	const normalisedRooms = Object.keys(config.room).reduce(
		(acc: { [index: string]: Room }, roomName) => {
			const room = config.room[roomName]
			acc[roomName] = {
				...room,
				path: path.resolve(path.join(options.project || '', room.path))
			}
			return acc
		},
		{}
	)

	return {
		...config,
		room: normalisedRooms
	}
}

export default { parse, normalise }
