import * as fs from 'mz/fs'
import * as path from 'path'

export let logPath: string
export const configure = async (projectPath: string) => {
  const isFile = await fs.lstat(projectPath).then(stats => stats.isFile())
  logPath = path.join(
    isFile ? path.dirname(projectPath) : projectPath,
    'roomservice-error.log'
  )

  if (fs.existsSync(logPath)) {
    fs.unlink(logPath)
  }
}

export const findOrCreate = () =>
  fs.exists(logPath).then(exists => {
    if (!exists) {
      return fs.writeFile(logPath, '')
    }
  })

export const write = (name: string, error: Error) =>
  fs.appendFile(logPath, `room: ${name}\nmessage: ${error.message}\n\n`)

export const append = (name: string, error: Error) =>
  findOrCreate().then(() => write(name, error))

export default {
  append,
  configure
}
