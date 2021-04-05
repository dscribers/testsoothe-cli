const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')

const createUrl = (pid) => {
  let url

  if (pid) {
    url = `/scenarios/${pid}`
  } else {
    const featureId = config.get('features.current')
    url = `/features/${featureId}/scenarios?length=all`
  }

  return url
}

const defaultData = []

const getQuestions = (scenarios, current) => {
  return [
    {
      name: 'pid',
      type: 'list',
      message: 'Select a scenario',
      default: current,
      choices: scenarios.map(({ pid, title }) => ({
        name: `${title} [${pid}]`,
        short: pid,
        value: pid,
      })),
    },
  ]
}

const successMessage = ({ title, pid }, log) =>
  log(`${title} [${pid}]`, `Current scenario`)

module.exports = (program, { error, success }) => {
  program
    .command('scenarios [id]')
    .option('-f --fresh', "creates a fresh scenarios' cache")
    .description('select a scenario')
    .action((pid, { fresh }) => {
      if (!config.has('features.current')) {
        return error('No feature selected')
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
