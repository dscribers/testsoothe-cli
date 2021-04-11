const config = require('../lib/config')
const runTest = require('../lib/runTest')
const prompt = require('../lib/prompt')
const { success } = require('../lib/logger')

module.exports = program => {
  program
    .command('test')
    .description('starts a test')
    .action(async () => {
      const choices = ['project', 'flow', 'feature', 'scenario']
        .filter((type) => config.has(`${type}s.current`))
        .map((type) => {
          const label = config.get(`${type}s.label`)

          return {
            name: `${type} [${label}]`,
            short: type,
            value: type,
          }
        })

      const { type } = await prompt([
        {
          name: 'type',
          type: 'list',
          message: 'What would you like to test?',
          choices,
        },
      ])

      const id = config.get(`${type}s.current`)
      const label = config.get(`${type}s.label`)
      const runnerKey = config.get('auth.runner_key')
      const url = `${process.env.DOMAIN_URL}/view?action=runner&type=${type}&id=${id}&key=${runnerKey}&logs=1`

      success(`${type} [${label}]`, 'Starting runner')

      runTest(url)
    })
}
