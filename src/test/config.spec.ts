import * as Config from '../config'

describe('Config', () => {
  describe('normalise()', () => {
    const config = {
      rooms: {
        main: {
          path: './main'
        },
        secondary: {
          path: 'secondary/'
        }
      }
    }
    test('normalises the paths of a given config', async () => {
      const result = await Config.normalise(config, {})

      // This is really not great, need to figure out a better way to deal with path.resolve
      expect(result.rooms.main.path.includes('roomservice')).toBe(true)
      expect(result.rooms.main.path.includes('main')).toBe(true)

      expect(result.rooms.secondary.path.includes('roomservice')).toBe(true)
      expect(result.rooms.secondary.path.includes('secondary')).toBe(true)
    })

    test('normalises the paths with the config and options project path', async () => {
      const result = await Config.normalise(config, { project: './mock' })

      expect(result.rooms.main.path.includes('roomservice')).toBe(true)
      expect(result.rooms.main.path.includes('/mock/main')).toBe(true)

      expect(result.rooms.secondary.path.includes('roomservice')).toBe(true)
      expect(result.rooms.secondary.path.includes('/mock/secondary')).toBe(true)
    })
  })

  describe('buildPath', () => {
    test('it handles a path to a file', async () => {
      const path = './mock/roomservice-secondary.config.toml'
      expect(await Config.buildPath(path)).toBe(path)
    })

    test('it handles a path to a directory with no ending slash', async () => {
      const path = './mock'
      expect(await Config.buildPath(path)).toBe('mock/roomservice.config.toml')
    })

    test('it handles a path to a directory with an ending slash', async () => {
      const path = './mock/'
      expect(await Config.buildPath(path)).toBe('mock/roomservice.config.toml')
    })
  })

  describe('readConfig', () => {
    test('it reads and parses config from a provided path', async () => {
      const result = await Config.readConfig('./mock/roomservice.config.toml')
      expect(Object.keys(result.rooms).length).toBeGreaterThan(0)
    })
  })

  describe('parse', () => {
    test('it reads a config path and parses it', async () => {
      const resultFromDir = await Config.parse('./mock')
      const resultFromPath = await Config.parse(
        './mock/roomservice.config.toml'
      )

      expect(Object.keys(resultFromDir.rooms).length).toBeGreaterThan(0)
      expect(resultFromDir).toEqual(resultFromPath)
    })
  })
})
