import * as ora from 'ora'
import * as chalk from 'chalk'
import { Results } from './build'

export const Spinner = (text: string) => {
  const spinner = new ora({
    text,
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

export const buildText = () =>
  chalk.bold(`Good ${getFriendlyTime()}! Just building your services...`)

export const resultText = (results: Results): string => {
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
      '!'
  }

  return text
}
