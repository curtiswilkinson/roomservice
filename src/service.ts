import { child_process } from 'mz'
import * as path from 'path'

import { Service } from './config'

const run = (options: any) => async (
	name: string,
	buildPath: string,
	command: string
): Promise<any> => {
	const fullPath = path.join(options.project, buildPath)

	// spawn the build process
	return child_process
		.exec(command, {
			cwd: path.join(process.cwd(), fullPath),
			maxBuffer: 1024 * 1000
		})
		.catch(error => {
			throw error
		})
}

export { run }
