import * as Cache from './cache'

import * as fs from 'mz/fs'
import * as rimraf from 'rimraf'

describe('Cache', () => {
  describe('_write', () => {})

  describe('_shouldBuild', () => {
    test('Returns true if there is no cache folder', async () => {
      const getPath = () => 'tmp/tmp/config'
      const result = await Cache._shouldBuild(getPath)('fakePath')

      expect(result).toBe(true)
    })

    test('Returns true if a source file is touch after the cache file', async () => {
      await fs.mkdir('./tmp')
      const cache = './tmp/cache'

      await fs.writeFile(cache, '')
      await new Promise(res => setTimeout(res, 2000)) // Needs a gap for find to determind time differences
      await fs.writeFile('./tmp/source.re', '')

      const result = await Cache._shouldBuild(() => cache)('./tmp/source.re')
      expect(result).toBe(true)

      await rimraf('./tmp', () => ({}))
    })

    test('Returns false if source files are older than cache', async () => {
      await fs.mkdir('./tmp2')
      const cache = './tmp2/cache'

      await fs.writeFile('./tmp2/source.re', '')
      await new Promise(res => setTimeout(res, 2000))
      await fs.writeFile(cache, '')

      const result = await Cache._shouldBuild(() => cache)('./tmp2/source.re')
      expect(result).toBe(false)

      await rimraf('./tmp2', () => ({}))
    })
  })
})
