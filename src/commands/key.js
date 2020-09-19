const inquirer = require('inquirer')
const config = require('../lib/config')
const open = require('open')

module.exports = (program, { error, success }) => {
  program
    .command('key')
    .description('shows the runner key or prompts to create one if not set')
    .action(async () => {
      let key = config.get('auth.runner_key')

      if (!key) {
        await open(`${process.env.DOMAIN_URL}/goto/runner.info`)

        try {
          const resp = await inquirer.prompt([
            {
              name: 'key',
              message: 'Enter your runner key:',
            },
          ])

          key = resp.key

          config.set('auth.runner_key', key)
        } catch (e) {
          error(e.message)
        }
      } else {
        key = key.replace(
          /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-/gi,
          'xxxxxxxx-xxxx-xxxx-xxxx-'
        )
      }

      success(`[${key}]`, 'Runner key')
    })
}