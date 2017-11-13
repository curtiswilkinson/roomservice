import * as ora from 'ora'
import * as chalk from 'chalk'
import { Results } from './build'

export const loadingText = (text: string) =>
  new ora({
    text,
    spinner: 'dots10'
  })

export const resultText = (results: Results): string => {
  let text = 'Hey Friend, all done!\n'

  if (results.built.length) {
    text += '\nLooks like these changed so I built them for you: '
    results.built.forEach(
      (name: string) => (text += '\n - ' + chalk.bold.green(name))
    )
  }

  if (results.cache.length) {
    text += "\n\nI noticed that these haven't changed since I last looked: "
    results.cache.forEach(
      (name: string) => (text += '\n - ' + chalk.bold.cyan(name))
    )
    text +=
      '\nBut if you want me to build them anyway, try ' +
      chalk.green.bold('--no-cache') +
      '!'
  }

  return text
}
