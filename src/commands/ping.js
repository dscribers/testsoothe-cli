const { http } = require('../lib/server')
const { error, success } = require('../lib/logger')
const spinner = require('../lib/spinner')

module.exports = program => {
  program
    .command('ping')
    .description('pings the server')
    .action(async () => {
      const loader = spinner('Pinging servers')
      loader.start()

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
