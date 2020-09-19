#!/usr/bin/env node
require('dotenv').config()

const colors = require('colors')
const clear = require('clear')
const figlet = require('figlet')
const program = require('commander')

const { version } = require('../package.json')
program.version(version)

// const files = require('../lib/files')
// const server = require('../lib/server')

// clear()

// console.log(
//   colors.rainbow(figlet.textSync(process.env.APP_NAME, { horizontalLayout: 'full' }))
// )
const commands = require('../src/commands')

const error = (message) => {
  console.log(colors.red(message))
}

const success = (message, title) => {
  let fullMessage = ''

  if (title) {
    fullMessage = `${title}: `
  }

  fullMessage += colors.green(message)

  console.log(fullMessage)
}

commands.forEach((prog) => {
  require(`../src/commands/${prog}`)(program, { success, error })
})

program.parse(process.argv)
