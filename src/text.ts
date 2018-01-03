import * as chalk from 'chalk'

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

export const noConfig =
  chalk.bold('Sorry! ') +
  "I couldn't find a " +
  chalk.cyan.bold('roomservice.config.toml') +
  ' file here.\n\n' +
  'Maybe you need to ' +
  chalk.yellow.bold('change directories') +
  ', or you can give me a ' +
  chalk.green.bold('--project') +
  ' flag to let me know where I need to look!'

const calculating = chalk.bold(
  'Good ' +
    getFriendlyTime() +
    '! ' +
    `I'm just figuring out which rooms I need to look at...\n`
)

const error =
  `\nIt looks like there was a few ${chalk.bold.red('errors')}...` +
  '\nIf I was you, I would go run the build commands you provided in the room and see what happens!'

const doneWithTime = (time: any) =>
  `\nOkay friend, all done! it took me ${chalk.bold.green(
    time + ' seconds'
  )} to do everything`

const cache =
  "\nI noticed some rooms didn't change! If you need me to build them anyway, let me know with " +
  chalk.green.bold('--no-cache')

export default {
  calculating,
  noConfig,
  doneWithTime,
  error,
  cache
}
