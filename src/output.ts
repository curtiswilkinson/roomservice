import * as ora from 'ora'
import * as chalk from 'chalk'

export const Spinner = (text: string) => {
  console.log(text)
  const spinner = new ora({
    text: 'Starting Build...',
    spinner: 'dots10'
  }).start()

  const colors = ['cyan', 'magenta', 'yellow', 'blue', 'green']
  colors.forEach((color: string, index: number) =>
    setTimeout(() => (spinner.color = color as any), index * 4000)
  )

  return spinner
}

const getFriendlyTime = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'morning'
  }

  if (hour < 18) {
    return 'afternoon'
  }

  return 'evening'
}

export const noConfigText =
  chalk.bold('Sorry! ') +
  "I couldn't find a " +
  chalk.cyan.bold('roomservice.config.toml') +
  ' file here.\n\n' +
  'Maybe you need to ' +
  chalk.yellow.bold('change directories') +
  ', or you can give me a ' +
  chalk.green.bold('--project') +
  ' flag to let me know where I need to look!'

export const buildText = (queue: any) =>
  chalk.bold(
    `Good ${getFriendlyTime()}! Just servicing your rooms: ` +
      roomsToBeBuilt(queue)
  ) + '\n'

export const resultText = (results: any): string => {
  let text = chalk.bold('Okay friend, all done!\n')

  if (results.built.length) {
    text += '\nLooks like these changed so I built them for you: '
    results.built.forEach(
      (name: string) => (text += '\n - ' + chalk.bold.green(name))
    )
    text += '\n'
  }

  if (results.cache.length) {
    text += "\nI noticed that these haven't changed since I last looked: "

    results.cache.forEach(
      (name: string) => (text += '\n - ' + chalk.bold.cyan(name))
    )
    text +=
      '\nBut if you want me to build them anyway, let me know with ' +
      chalk.green.bold('--no-cache') +
      '!\n'
  }

  if (results.errored.length) {
    text += '\nI encountered an error while I was looking at these: '

    results.errored.forEach(
      (name: string) => (text += '\n - ' + chalk.bold.red(name))
    )
    text +=
      '\nIf I was you, I would go run the build commands you provided in the room and see what happens!'
  }

  return text
}

const roomsToBeBuilt = (queue: any): string[] => {
  const set: Set<string> = Object.keys(queue).reduce((acc, hook: any) => {
    if (hook === 'cache') {
      return acc
    }

    const rooms: any = queue[hook]

    rooms.forEach((room: string) => acc.add(room))
    return acc
  }, new Set())

  return Array.from(set)
}
