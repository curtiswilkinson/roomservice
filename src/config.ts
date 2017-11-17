const toml = require('toml')
import * as fs from 'mz/fs'

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
	room: Room[]
}

const parse = (path: string): Promise<any> =>
	fs.readFile(path + 'roomservice.config.toml').then(toml.parse)

export default { parse }
