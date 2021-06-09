const config = require('../lib/config')
const prompt = require('../lib/prompt')
const { domainUrl } = require('../lib/env')
const { error, info, success } = require('../lib/logger')

module.exports = program => {
  program
    .command('key')
    .description('shows the runner key or prompts to create one if not set')
    .action(async () => {
      let key = config.get('auth.runner_key')

      if (!key) {
        info(`Get your key from ${domainUrl()}/goto/runner.info`)

        const { key: respKey } = await prompt([
          {
            name: 'key',
            message: 'Enter your runner key:',
          },
        ])

        if (!$respKey) {
          return error('No runner key set.')
        }

        key = respKey

        config.set('auth.runner_key', key)
      } else {
        key = key.replace(
          /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-/gi,
          'xxxxxxxx-xxxx-xxxx-xxxx-'
        )
      }

      success(`[${key}]`, 'Runner key')
    })
}
