const { login, logout } = require('../lib/server')

module.exports = (program, { error, success }) => {
  program
    .command('login [email]')
    .description('logs a new user in')
    .action(async (defEmail) => {
      try {
        const { email } = await login(defEmail)

        success(`Logged in (${colors.italic(email)})`)
      } catch (e) {
        error(e.message)
      }
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
