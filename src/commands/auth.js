const colors = require('colors')
const { login, logout } = require('../lib/server')
const { error, success } = require('../lib/logger')

module.exports = program => {
  program
    .command('login [email]')
    .description('logs a new user in')
    .action(async (defEmail) => {
      const { email } = await login(false, defEmail)

      if (!email) {
        return
      }

      success(`Logged in (${colors.italic(email)})`)
    })

  program
    .command('logout')
    .description('logs the current user out')
    .action(async () => {
      try {
        const email = await logout()

        let message = 'Logged out'

        if (email) {
          message += ` (${colors.italic(email)})`
        }

        success(message)
      } catch (e) {
        error(e.message)
      }
    })
}
