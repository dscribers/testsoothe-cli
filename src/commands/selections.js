const config = require('../lib/config')
const { error, success } = require('../lib/logger')

module.exports = program => {
  program
    .command('selections')
    .option('-c, --clear', 'clears all selections')
    .description('show active selections')
    .action(async ({ clear }) => {
      const selections = ['project', 'flow', 'feature', 'scenario']

      if (clear) {
        selections.forEach(type => {
          config.delete(`${type}s`)
        })

        return success(`Cleared all selections`)
      }

      const types = selections.filter((type) =>
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
