const config = require('../lib/config')
const { error, success } = require('../lib/logger')

module.exports = program => {
  program
    .command('selections')
    .description('show active selections')
    .action(async () => {
      const types = ['project', 'flow', 'feature', 'scenario'].filter((type) =>
        config.has(`${type}s.current`)
      )

      types.forEach((type) => {
        const label = config.get(`${type}s.label`)
        const id = config.get(`${type}s.current`)

        success(`${label} [${id}]`, type)
      })

      if (!types.length) {
        error('No selections made yet');
      }
    })
}
