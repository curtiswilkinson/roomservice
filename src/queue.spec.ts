import Queue, { Queue as QueueT } from './queue'

describe('Queue', () => {
	describe('build', () => {
		test('Maps a room to a queue correctly', async () => {
			const config = {
				room: {
					test: {
						path: '',
						run: 'run',
						beforeService: 'beforeService',
						runSync: 'runSync',
						afterService: 'afterService'
					}
				}
			}

			const result = await Queue.build(config, { 'no-cache': true })
			const expected: QueueT = {
				run: ['test'],
				beforeService: ['test'],
				runSync: ['test'],
				afterService: ['test'],
				cache: []
			}

			expect(result).toEqual(expected)
		})
	})
})
