const version = require('../package.json').version
import * as rp from 'request-promise'
import Text from './text'

const validate = async () => {
  try {
    const currentVersion = await rp
      .get(
        'https://raw.githubusercontent.com/curtiswilkinson/roomservice/master/package.json'
      )
      .then(JSON.parse)
      .then(json => json.version)

    if (currentVersion > version) {
      console.log(Text.newVersion(version, currentVersion))
    } else {
      console.log(Text.version(version))
    }
  } catch {
    // happy to let this slide
  }
}

export default { validate }
