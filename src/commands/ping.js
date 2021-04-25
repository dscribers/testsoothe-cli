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
        const { message } = await http.get('/ping')

        loader.stop()
        success(message)
      } catch ({ message }) {
        loader.stop()
        error(message)
      }
    })
}
