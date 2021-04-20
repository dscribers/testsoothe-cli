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

commands.forEach((prog) => {
  require(`../src/commands/${prog}`)(program)
})

program.parse(process.argv)
