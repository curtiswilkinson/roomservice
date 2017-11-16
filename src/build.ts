import * as path from 'path'
import { child_process } from 'mz'
import { Config, Service } from './config'
import { Options } from './index'
import Cache from './cache'

import { Spinner, buildText, resultText } from './output'

interface Queue {
	run: string[]
	runBeforeSync: string[]
	runSync: string[]
	runAfterSync: string[]
}

const init = async (config: Config, options: Options) => {
	const spinner = Spinner(buildText())
	const queue = buildQueue(config, options)

	// run
	queue.run.forEach(console.log)

	// runBeforeSync
	await Promise.all(queue.runBeforeSync.map(console.log))

	// runSync
	for (let name of queue.runSync) {
		await console.log(name)
	}

	// runAfterSync
	await Promise.all(queue.runAfterSync.map(console.log))
}

const buildQueue = (config: Config, options: Options): Queue => {
	const serviceNames = Object.keys(config.service)

	return serviceNames.reduce(
		(queue: Queue, name: string) => {
			const service: Service = config.service[name] as Service

			if (options['no-cache'] || Cache.shouldBuild(service.path)) {
				queue.run.push(name)
				if (service.run) {
					queue.run.push(name)
				}
				if (service.runBeforeSync) {
					queue.runBeforeSync.push(name)
				}
				if (service.runSync) {
					queue.runSync.push(name)
				}
				if (service.runAfterSync) {
					queue.runAfterSync.push(name)
				}
			}
			return queue
		},
		{
			run: [],
			runBeforeSync: [],
			runSync: [],
			runAfterSync: []
		}
	)
}

export default { init }
