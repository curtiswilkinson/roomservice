import * as Config from './config'

describe('Config', () => {
  describe('normalise()', () => {
    const config = {
      room: {
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
      expect(result.room.main.path.includes('home')).toBe(true)
      expect(result.room.main.path.includes('roomservice')).toBe(true)
      expect(result.room.main.path.includes('main')).toBe(true)

      expect(result.room.secondary.path.includes('home')).toBe(true)
      expect(result.room.secondary.path.includes('roomservice')).toBe(true)
      expect(result.room.secondary.path.includes('secondary')).toBe(true)
    })

    test('normalises the paths with the config and options project path', async () => {
      const result = await Config.normalise(config, { project: './mock' })

      expect(result.room.main.path.includes('home')).toBe(true)
      expect(result.room.main.path.includes('roomservice')).toBe(true)
      expect(result.room.main.path.includes('/mock/main')).toBe(true)

      expect(result.room.secondary.path.includes('home')).toBe(true)
      expect(result.room.secondary.path.includes('roomservice')).toBe(true)
      expect(result.room.secondary.path.includes('/mock/secondary')).toBe(true)
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
})
