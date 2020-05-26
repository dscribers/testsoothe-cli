#!/usr/bin/env node

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
//   colors.rainbow(figlet.textSync('TestSuite', { horizontalLayout: 'full' }))
// )
const commands = require('../src/commands')

const error = (message) => {
  console.log(colors.red(message))
}

const success = (message) => {
  console.log(colors.green(message))
}

commands.forEach((prog) => {
  require(`../src/commands/${prog}`)(program, { success, error })
})

program.parse(process.argv)
