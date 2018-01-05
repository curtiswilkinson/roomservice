import Config from './config'

describe('Config', () => {
  describe('normalise', () => {
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
})
