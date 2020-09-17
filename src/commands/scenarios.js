const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')

const createUrl = (id) => {
  let url

  if (id) {
    url = `/scenarios/${id}`
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
      name: 'id',
      type: 'list',
      message: 'Select a scenario',
      default: current,
      choices: scenarios.map(({ id, title }) => ({
        name: title,
        short: title,
        value: id,
      })),
    },
  ]
}

const successMessage = (scenario, log) =>
  log(scenario.title, `Current scenario`)

module.exports = (program, { error, success }) => {
  program
    .command('scenarios [id]')
    .option('-f --fresh', "creates a fresh scenarios' cache")
    .description('select a scenario')
    .action((id, { fresh }) => {
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

      return id ? select(id, fresh, error) : showList(fresh, error)
    })
}
