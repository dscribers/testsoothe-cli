const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')

const createUrl = (pid) => {
  let url = '/projects'

  if (pid) {
    url += `/${pid}`
  } else {
    url += '?length=all'
  }

  return url
}

const defaultData = []

const getQuestions = (projects, current) => {
  return [
    {
      name: 'pid',
      type: 'list',
      message: 'Select a project',
      default: current,
      choices: projects.map(({ pid, name }) => ({
        name: `${name} [${pid}]`,
        short: pid,
        value: pid,
      })),
    },
  ]
}

const successMessage = ({ name, pid }, log) => {
  config.delete('features')
  config.delete('scenarios')
  config.delete('flows')
  log(`${name} [${pid}]`, `Current project`)
}

module.exports = (program, { error, success }) => {
  program
    .command('projects [id]')
    .option('-f --fresh', "creates a fresh projects' cache")
    .description('select a project')
    .action((pid, { fresh }) => {
      const { select, showList } = template(command, {
        createUrl,
        defaultData,
        getQuestions,
        labelKey: 'name',
        success: (project) => successMessage(project, success),
      })

      return pid ? select(pid, fresh, error) : showList(fresh, error)
    })
}
