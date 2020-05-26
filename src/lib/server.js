const colors = require('colors')
const { Spinner } = require('clui')

const config = require('./config')
const request = require('./request')
const inquirer = require('inquirer')

const getCredentials = (email) => {
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

  return inquirer.prompt(questions)
}

const getToken = async (email) => {
  const credentials = await getCredentials(email || config.get('auth.email'))

  const { data } = await request.post(
    'http://backend.test/api/auth/login',
    credentials
  )

  if (data.token) {
    config.set('auth.email', credentials.email)
    config.set('auth.token', data.token)

    return { email: credentials.email, token: data.token }
  } else {
    throw new Error('TestSuite token was not found in the response')
  }
}

const isValidToken = async () => {
  try {
    const token = config.get('auth.token')

    if (!token) {
      return false
    }

    await request.get('user/profile')
    return true
  } catch (e) {
    return false
  }
}

const login = async (email) => {
  try {
    // const status = new Spinner('Authenticating you. Please wait ...')

    if (email || !(await isValidToken())) {
      logout(false)

      await getToken(email)
    }
  } finally {
    // status.stop()
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
  login,
  logout,
  request,
}
