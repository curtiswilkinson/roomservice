const toml = require('toml')
import * as fs from 'mz/fs'

export interface Service {
	// LifeCycle
	run?: string
	runBeforeSync?: string
	runSync?: string
	runAfterSync?: string

	// Other
	path: string
}

export interface Config {
	service: Service[]
}

const parse = (path: string): Promise<any> =>
	fs.readFile(path + 'roomservice.config.toml').then(toml.parse)

export default { parse }
