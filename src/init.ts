import * as fs from 'mz/fs'
import * as path from 'path'

export default (projectPath = './') =>
  fs.copyFile(
    path.join(__dirname, './template/roomservice.config.toml'),
    path.join(projectPath, 'roomservice.config.toml'),
    () => ({})
  )
