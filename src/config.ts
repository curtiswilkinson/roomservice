const toml = require('toml')
import * as fs from 'mz/fs'

interface Service {
  build: string
  path: string
}

export interface Config {
  service: Service[]
}

const parse = (path: string): Promise<any> =>
  fs.readFile(path + '/zoey.config.toml').then(toml.parse)

export default { parse }
