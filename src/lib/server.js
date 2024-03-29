const config = require('./config')
const http = require('./http')
const prompt = require('./prompt')
const spinner = require('ora')
const { appName } = require('./env')

const getCredentials = email => {
  const questions = [
    {
      name: 'email',
      type: 'type',
      message: 'Enter e-mail address:',
      default: email,
      validate: function (value) {
        const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

        if (regex.test(value)) {
          return true
        } else {
          return 'Please enter e-mail address.'
        }
      },
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: function (value) {
        if (value.length) {
          return true
        } else {
          return 'Please enter your password.'
        }
      },
    },
  ]

  if ((email || '').trim()) {
    questions.shift()
  }

  return prompt(questions)
}

const getToken = async email => {
  const { email: newEmail, password } = await getCredentials(email)

  if (newEmail) {
    email = newEmail
  }

  if (!email || !password) {
    return {}
  }

  const loader = spinner(`Logging in with ${email}`).start()

  try {
    const { data } = await http.post('/auth/login?cmd=1', { email, password, source: 'cli' })

    if (data.token) {
      config.set('auth.email', email)
      config.set('auth.token', data.token)

      if (data.runner_key) {
        config.set('auth.runner_key', data.runner_key)
      }

      return { email, token: data.token }
    } else {
      throw new Error(
        appName() + ' token was not found in the response'
      )
    }
  } catch (e) {
    return { error: e.message }
  }
  finally {
    loader.stop()
  }
}

const getCachedProfile = async () => {
  try {
    const auth = config.get('auth')

    if (!auth.token) {
      return false
    }

    return auth
  } catch (e) {
    return false
  }
}

const login = async (force, email) => {
  const profile = await getCachedProfile()

  if (force || !profile.email || (email && email !== profile.email)) {
    let authEmail = email

    if (force) {
      authEmail = logout()
    }

    return await getToken(authEmail)
  } else {
    return { email: profile.email }
  }
}

const logout = () => {
  const email = config.get('auth.email')

  require('../commands').forEach((command) => {
    config.delete(command)
  })

  return email
}

module.exports = {
  getCachedProfile,
  http,
  login,
  logout,
}
