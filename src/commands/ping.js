const { loading, http } = require('../lib/server')

module.exports = (program, { error, success }) => {
  program
    .command('ping')
    .description('pings the server')
    .action(async () => {
      const loader = loading('Pinging servers')

      try {
        const { status } = await http.get('/echo')

        loader.stop()
        success(status)
      } catch ({ message }) {
        loader.stop()
        error(message)
      }
    })
}
