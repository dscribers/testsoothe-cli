const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const files = require('./lib/files')
// const server = require('./lib/server')

clear()

console.log(
  chalk.yellow(figlet.textSync('TestSuite', { horizontalLayout: 'full' }))
)

const run = async () => {
  try {
    await server.login()
  } catch (e) {
    console.log(chalk.red(e.message))
  }
}

// run()
