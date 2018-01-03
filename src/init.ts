import * as fs from 'mz/fs'
import * as path from 'path'

export default (projectPath = './') =>
  fs.copyFile(
    path.join(__dirname, '../src/template/roomservice.config.toml'),
    path.resolve(
      process.cwd(),
      path.join(projectPath, 'roomservice.config.toml')
    ),
    () => ({})
  )
