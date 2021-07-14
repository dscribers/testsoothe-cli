const colors = require('colors')
const { getCachedProfile, login, logout } = require('../lib/server')
const { error, info, success } = require('../lib/logger')

module.exports = program => {
  program
    .command('login [email]')
    .description('logs a new user in')
    .action(async (defEmail) => {
      const { email, error: loginError } = await login(false, defEmail)

      if (loginError) {
        error(loginError)
      }

      if (!email) {
        return
      }

      success(`Logged in as ${colors.italic(email)}`)
    })

  program
    .command('whoami')
    .description('Fetches the currently logged in user')
    .action(async () => {
      const { email } = await getCachedProfile()

      if (!email) {
        return info(`${colors.italic.bgRed.white('NOBODY')} Maybe log in now?`)
      }

      success(email)
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
