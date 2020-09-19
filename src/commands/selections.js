const config = require('../lib/config')

module.exports = (program, { error, success }) => {
  program
    .command('selections')
    .description('show active selections')
    .action(async () => {
      const types = ['project', 'flow', 'feature', 'scenario'].filter((type) =>
        config.has(`${type}s.current`)
      )

      types.forEach((type) => success(config.get(`${type}s.label`), type))

      if (!types.length) {
        error('No selections made yet');
      }
    })
}
