import Queue from './queue'

describe('Queue', () => {
	describe('build', () => {
		test('Maps a room to a queue correctly', () => {
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

			const result = Queue.build(config, { 'no-cache': true })
			const expected = {
				run: ['test'],
				beforeService: ['test'],
				runSync: ['test'],
				afterService: ['test']
			}

			expect(result).toEqual(expected)
		})
	})
})
