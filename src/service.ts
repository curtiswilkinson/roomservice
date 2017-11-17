import { child_process } from 'mz'
import * as path from 'path'
import Cache from './cache'

import { Room } from './config'

const run = async (
	options: any,
	name: string,
	buildPath: string,
	command: string
): Promise<any> => {
	const fullPath = path.join(options.project, buildPath)

	// spawn the build process
	return child_process
		.exec(command, {
			cwd: path.join(process.cwd(), fullPath),
			maxBuffer: 1024 * 10
		})
		.then(() => Cache.write(buildPath))
		.catch(e => {
			throw e
		})
}

export default { run }
