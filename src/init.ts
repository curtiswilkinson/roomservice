import * as fs from 'mz/fs'
import * as path from 'path'

export default (projectPath = './') =>
  fs.copyFile(
    path.join(__dirname, './template/zoey.config.toml'),
    path.join(projectPath, 'zoey.config.toml'),
    () => ({})
  )
