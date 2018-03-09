import * as chalk from 'chalk'
import * as username from 'username'

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
  "I couldn't find a config file here.\n\n" +
  'Maybe you need to ' +
  chalk.yellow.bold('change directories') +
  ', or you can give me a ' +
  chalk.green.bold('--project') +
  ' flag to let me know where I need to look!'

const calculating = chalk.bold(
  'Good ' +
    getFriendlyTime() +
    '! ' +
    `I'm just figuring out which rooms I need to look at...`
)

const error =
  `\nIt looks like there was a few ${chalk.bold.red('errors')}...` +
  '\nIf I was you, I would go run the build commands you provided in the room and see what happens!'

const doneWithTime = async (time: any) =>
  `\nOkay ${await username()}, all done! it took me ${chalk.bold.green(
    time + ' seconds'
  )} to do everything`

const cache =
  "\nI noticed some rooms didn't change! If you need me to build them anyway, let me know with " +
  chalk.green.bold('--no-cache')

const version = (version: string) => chalk.grey('V' + version) + '\n'

const newVersion = (currentVersion: string, newVersion: string) =>
  chalk.grey(
    `I've got a new update! I'm currently ${chalk.bold.yellow(
      'V' + currentVersion
    )}, but there is ${chalk.bold.green('V' + newVersion)}`
  ) + '\n'

const bothIgoreAndOnly =
  chalk.bold('Sorry!') +
  ` You've provide both the ` +
  chalk.bold.green('--ignore') +
  ' and the ' +
  chalk.bold.green('--only') +
  ' options' +
  '\n\nYou can only use ' +
  chalk.bold('one') +
  ' of these!'

const status = {
  finished: chalk.bold.green('Finished'),
  error: chalk.bold.red('Error'),
  cache: chalk.bold.cyan('No Change'),
  queued: chalk.bold.yellow('In Queue'),
  runSynchronous: chalk.bold.green('Run Synchronously...'),
  runParallel: chalk.bold.green('Run Synchronously...'),
  before: chalk.bold.green('Before...'),
  after: chalk.bold.green('After...'),
  waiting: chalk.bold.yellow('Waiting'),
  finally: chalk.bold.green('Finally...')
}

export default {
  calculating,
  noConfig,
  doneWithTime,
  error,
  cache,
  status,
  version,
  newVersion,
  bothIgoreAndOnly
}
