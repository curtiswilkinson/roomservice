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

    test('It will not queue rooms that are provided in the ignore list', async () => {
      const config = {
        room: {
          one: { path: '', beforeService: 'one '},
          two: { path: '', beforeService: 'two'}
        }
      }

      const result = await Queue._build(['one'])(config, { ignore: true })
      expect(result.beforeService.length).toEqual(1)
    })
  })
})
