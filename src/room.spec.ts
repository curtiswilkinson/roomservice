import Room from './room'
import * as fs from 'mz/fs'

describe('Room', () => {
  test('It will run the provided command', async () => {
    await Room.service('./', 'touch roomservice.tmp')
    expect(
      await fs
        .lstat('roomservice.tmp')
        .then(stats => (stats.isFile() ? true : false))
    ).toBe(true)

    await fs.unlink('roomservice.tmp')
  })
})
