import Build, { pushSuccess } from '../build'
import Text from '../text'
import * as fs from 'mz/fs'
import * as rimraf from 'rimraf'
import { PassThrough } from 'stream'

describe('build', () => {
  test('runs commands appropriate for the given config', async () => {
    const config = {
      rooms: {
        one: {
          path: './test_build',
          before: 'mkdir ./one',
          runParallel: 'touch ./one/parallel',
          runSynchronous: 'touch ./one/sync',
          after: 'touch ./one/after',
          finally: 'touch ./one/finally'
        },
        two: {
          path: 'test_build',
          before: 'mkdir ./two',
          runParallel: 'touch ./two/parallel',
          runSynchronous: 'touch ./two/sync',
          after: 'touch ./two/after',
          finally: 'touch ./two/finally'
        }
      }
    }
    await Build(config, { 'no-cache': true })

    return Promise.all([
      fs
        .exists('./test_build/one/parallel')
        .then(result => expect(result).toEqual(true)),
      fs
        .exists('./test_build/one/sync')
        .then(result => expect(result).toEqual(true)),
      fs
        .exists('./test_build/one/after')
        .then(result => expect(result).toEqual(true)),
      fs
        .exists('./test_build/one/finally')
        .then(result => expect(result).toEqual(true)),

      fs
        .exists('./test_build/two/parallel')
        .then(result => expect(result).toEqual(true)),
      fs
        .exists('./test_build/two/sync')
        .then(result => expect(result).toEqual(true)),
      fs
        .exists('./test_build/two/after')
        .then(result => expect(result).toEqual(true)),
      fs
        .exists('./test_build/two/finally')
        .then(result => expect(result).toEqual(true))
    ])
  })
  test('it writes an error log file when a room errors', async () => {
    const config = {
      rooms: {
        one: {
          path: './test_build',
          before: 'rmf-stf'
        },
        two: {
          path: 'test_build'
        }
      }
    }

    await Build(config, { 'no-cache': true })

    return await fs
      .exists('./roomservice-error.log')
      .then(result => expect(result).toEqual(true))
      .then(() => fs.unlink('./roomservice-error.log'))
  })

  test('it will not run the finally hook if no-finally is provided', async () => {
    const config = {
      rooms: {
        one: {
          path: './test_build',
          before: 'touch test',
          finally: 'rm -rf test'
        }
      }
    }

    await Build(config, { 'no-cache': true, 'no-finally': true })

    return await fs
      .exists('./test_build/test')
      .then(result => expect(result).toEqual(true))
  })
  describe('pushSuccess()', () => {
    const resultsNew: any = { cache: [], built: [], errored: [] }
    const queueNew: any = {
      before: [],
      runParallel: [],
      runSynchronous: [],
      after: [],
      finally: [],
      cache: []
    }
    test('it will not push a room that has errored before', () => {
      const results = { ...resultsNew, errored: ['main'] }
      pushSuccess(results, { ...queueNew }, 'runParallel', 'main')

      expect(results).toEqual(results)
    })

    test('it will push a room that has not errored before', () => {
      const results = { ...resultsNew, errored: ['secondary'] }
      pushSuccess(results, { ...queueNew }, 'runParallel', 'main')
    })

    test('it will set the room to finished if there is no more work', () => {
      const results = { ...resultsNew }
      const queue = { ...queueNew, runParallel: ['main'] }

      const result = pushSuccess(results, queue, 'runParallel', 'main')
      expect(result).toEqual(Text.status.finished)
    })
  })
  beforeAll(() => {
    rimraf('./test_build', () => ({}))
    return fs.mkdir('test_build')
  })
  afterAll(() => {
    rimraf('./test_build', () => ({}))
  })
})
