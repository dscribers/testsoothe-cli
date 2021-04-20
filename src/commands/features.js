const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')
const { error, success } = require('../lib/logger')

const createUrl = (id) => {
  let url

  if (id) {
    url = `/features/${id}`
  } else {
    const projectId = config.get('projects.current')
    url = `/projects/${projectId}/features?length=all`
  }

  return url
}

const defaultData = []

const getQuestions = (features, current) => {
  return [
    {
      name: 'id',
      type: 'list',
      message: 'Select a feature',
      default: current,
      choices: features.map(({ id, title }) => ({
        name: `${title} [${id}]`,
        short: id,
        value: id,
      })),
    },
  ]
}

const successMessage = ({ title, id }, log) => {
  config.delete('scenarios')
  log(`${title} [${id}]`, 'Current feature')
}

module.exports = program => {
  program
    .command('features [id]')
    .option('-f, --fresh', "creates a fresh features' cache")
    .description('select a feature')
    .action((id, { fresh }) => {
      if (!config.has('projects.current')) {
        return error('No project selected')
      }

      const { select, showList } = template(command, {
        createUrl,
        defaultData,
        getQuestions,
        labelKey: 'title',
        success: (item) => successMessage(item, success),
      })

      return id ? select(id, fresh, error) : showList(fresh, error)
    })
}
