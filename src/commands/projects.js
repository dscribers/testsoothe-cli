const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')
const { error, success } = require('../lib/logger')

const createUrl = (id) => {
  let url = '/projects'

  if (id) {
    url += `/${id}`
  } else {
    url += '?length=all'
  }

  return url
}

const defaultData = []

const getQuestions = (projects, current) => {
  return [
    {
      name: 'id',
      type: 'list',
      message: 'Select a project',
      default: current,
      choices: projects.map(({ id, name }) => ({
        name: `${name} [${id}]`,
        short: id,
        value: id,
      })),
    },
  ]
}

const successMessage = ({ name, id }, log) => {
  config.delete('features')
  config.delete('scenarios')
  config.delete('flows')
  log(`${name} [${id}]`, `Current project`)
}

module.exports = program => {
  program
    .command('projects [id]')
    .option('-f, --fresh', "creates a fresh projects' cache")
    .description('select a project')
    .action((id, { fresh }) => {
      const { select, showList } = template(command, {
        createUrl,
        defaultData,
        getQuestions,
        labelKey: 'name',
        success: (project) => successMessage(project, success),
      })

      return id ? select(id, fresh, error) : showList(fresh, error)
    })
}
