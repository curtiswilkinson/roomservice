import Init from '../init'
import * as fs from 'mz/fs'

describe('Init', () => {
  test('it will create a project file in the current directory', async () => {
    await Init()
    expect(
      await fs.lstat('./roomservice.config.yml').then(stats => stats.isFile())
    ).toBe(true)

    await fs.unlink('./roomservice.config.yml')
  })
})
