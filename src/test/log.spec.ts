import * as randomString from 'randomstring'
import * as fs from 'mz/fs'
import * as path from 'path'
import * as rimraf from 'rimraf'

import * as Log from '../log'
import { tmpdir } from 'os'

const tmpDir = randomString.generate(8)

describe('log', () => {
  beforeAll(async () => {
    await fs.mkdir(tmpDir)
  })
  afterEach(done => {
    rimraf(tmpDir, () => {
      fs.mkdir(tmpDir).then(done)
    })
  })
  afterAll(done => {
    rimraf(tmpDir, done)
  })

  describe('configure', () => {
    test('it will set the logPath for file project paths', async () => {
      const configPath = path.join(tmpDir, 'roomservice.config.yml')

      await fs.writeFile(configPath, '')
      await Log.configure(configPath)

      expect(Log.logPath).toEqual(tmpDir + '/roomservice-error.log')
    })

    test('it will set the logPath for directory project paths', async () => {
      await Log.configure(tmpDir)

      expect(Log.logPath).toEqual(tmpDir + '/roomservice-error.log')
    })

    test('it will delete an existing error log', async () => {
      const logPath = path.join(tmpDir, 'roomservice-error.log')

      await fs.writeFile(logPath, '')
      await Log.configure(tmpDir)

      expect(await fs.exists(logPath)).toEqual(false)
    })
  })

  describe('findOrCreate', () => {
    test('it will create a file', async () => {
      await Log.configure(tmpDir)
      const logPath = path.join(tmpDir, 'roomservice-error.log')
      expect(await fs.exists(logPath)).toBe(false)

      await Log.findOrCreate()

      expect(await fs.exists(logPath)).toBe(true)
    })
  })

  describe('write', () => {
    test('it will write to a log file', async () => {
      await Log.configure(tmpDir)

      await Log.write('roomName', new Error('It went horribly, horribly wrong'))

      const result = await fs.readFile(Log.logPath, 'utf8')
      expect(result.includes('roomName')).toEqual(true)
      expect(result.includes('It went horribly, horribly wrong')).toEqual(true)
    })
  })
})
