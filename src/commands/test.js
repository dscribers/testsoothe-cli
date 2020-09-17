const inquirer = require('inquirer')
const config = require('../lib/config')
const open = require('open')

module.exports = (program, { error, success }) => {
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

      const { type } = await inquirer.prompt([
        {
          name: 'type',
          type: 'list',
          message: 'What would you like to test?',
          choices,
        },
      ])

      const id = config.get(`${type}s.current`)
      const label = config.get(`${type}s.label`)
      const url = `${process.env.DOMAIN_URL}/test/${type}/${id}`

      await open(url)

      console.log()
      success(`${type} [${label}]`, 'Running in the browser')
    })
}
