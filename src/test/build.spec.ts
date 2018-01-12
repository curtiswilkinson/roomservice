import Build from '../build'
import * as fs from 'mz/fs'
import * as rimraf from 'rimraf'

describe('build', () => {
  test('runs commands appropriate for the given config', async () => {
    const config = {
      rooms: {
        one: {
          path: '',
          before: 'mkdir one',
          runParallel: 'touch ./one/parallel',
          runSynchronous: 'touch ./one/sync',
          after: 'touch ./one/after',
          finally: 'touch ./one/finally'
        },
        two: {
          path: '',
          before: 'mkdir two',
          runParallel: 'touch ./two/parallel',
          runSynchronous: 'touch ./two/sync',
          after: 'touch ./two/after',
          finally: 'touch ./two/finally'
        }
      }
    }
    await Build(config, { 'no-cache': true })

    return Promise.all([
      fs.exists('./one/parallel').then(result => expect(result).toEqual(true)),
      fs.exists('./one/sync').then(result => expect(result).toEqual(true)),
      fs.exists('./one/after').then(result => expect(result).toEqual(true)),
      fs.exists('./one/finally').then(result => expect(result).toEqual(true)),

      fs.exists('./two/parallel').then(result => expect(result).toEqual(true)),
      fs.exists('./two/sync').then(result => expect(result).toEqual(true)),
      fs.exists('./two/after').then(result => expect(result).toEqual(true)),
      fs.exists('./two/finally').then(result => expect(result).toEqual(true))
    ])
  })
  beforeAll(() => {
    rimraf('./one', () => ({}))
    rimraf('./two', () => ({}))
  })
  afterAll(() => {
    rimraf('./one', () => ({}))
    rimraf('./two', () => ({}))
  })
})
