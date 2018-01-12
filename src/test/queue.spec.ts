import Queue, { Queue as QueueT } from '../queue'

describe('Queue', () => {
  describe('build()', () => {
    test('Maps a room to a queue correctly', async () => {
      const config = {
        rooms: {
          test: {
            path: '',
            runParallel: 'runParallel',
            before: 'before',
            runSynchronous: 'runSynchronous',
            after: 'after',
            finally: 'finally'
          }
        }
      }

      const result = await Queue.build(config, { 'no-cache': true })
      const expected: QueueT = {
        runParallel: ['test'],
        before: ['test'],
        runSynchronous: ['test'],
        after: ['test'],
        finally: ['test'],
        cache: []
      }

      expect(result).toEqual(expected)
    })

    test('It will not queue rooms that are provided in the ignore list', async () => {
      const config = {
        rooms: {
          one: { path: '', before: 'one ' },
          two: { path: '', before: 'two' }
        }
      }

      const result = await Queue._build(['one'])(config, { ignore: true })
      expect(result.before.length).toEqual(1)
    })
  })

  describe('roomFinished', () => {
    const queue = {
      before: [''],
      cache: [''],
      runParallel: [''],
      runSynchronous: ['roomOne', 'roomTwo'],
      after: ['roomOne', 'roomThree'],
      finally: ['']
    }
    test('it will return false if the room is contained in any of the hooks', () => {
      expect(Queue.roomFinished(queue, 'before', 'roomOne')).toEqual(false)
      expect(Queue.roomFinished(queue, 'before', 'roomTwo')).toEqual(false)
      expect(Queue.roomFinished(queue, 'before', 'roomThree')).toEqual(false)
    })

    test('it will return true if the room is not present in any remaining hooks', () => {
      expect(Queue.roomFinished(queue, 'before', 'roomFour')).toEqual(true)
    })
  })

  describe('complete', () => {
    test('it will flag the given room as complete', () => {
      const queue = {
        runSync: ['roomOne', 'roomTwo'],
        beforeService: ['roomThree']
      }

      const expected: any = {
        runSync: ['roomTwo'],
        beforeService: ['roomThree']
      }

      Queue.complete(queue, 'runSync', 'roomOne')

      expect(queue).toEqual(expected)
    })
  })
})
