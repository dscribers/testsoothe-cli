const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')

const createUrl = (pid) => {
  let url

  if (pid) {
    url = `/features/${pid}`
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
      name: 'pid',
      type: 'list',
      message: 'Select a feature',
      default: current,
      choices: features.map(({ pid, title }) => ({
        name: `${title} [${pid}]`,
        short: pid,
        value: pid,
      })),
    },
  ]
}

const successMessage = ({ title, pid }, log) => {
  config.delete('scenarios')
  log(`${title} [${pid}]`, 'Current feature')
}

module.exports = (program, { error, success }) => {
  program
    .command('features [id]')
    .option('-f --fresh', "creates a fresh features' cache")
    .description('select a feature')
    .action((pid, { fresh }) => {
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

      return pid ? select(pid, fresh, error) : showList(fresh, error)
    })
}
