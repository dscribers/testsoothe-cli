const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')

const createUrl = (id) => {
  let url

  if (id) {
    url = `/project-flows/${id}`
  } else {
    const projectId = config.get('projects.current')
    url = `/projects/${projectId}/flows?length=all`
  }

  return url
}

const defaultData = []

const getQuestions = (flows, current) => {
  return [
    {
      name: 'id',
      type: 'list',
      message: 'Select a project flow',
      default: current,
      choices: flows.map(({ id, name }) => ({
        name,
        short: name,
        value: id,
      })),
    },
  ]
}

const successMessage = (flow, log) =>
  log(`Current project flow: <id: ${flow.id}> ${flow.name}`)

module.exports = (program, { error, success }) => {
  program
    .command('flows [id]')
    .option('-f --fresh', "creates a fresh flows' cache")
    .description('select a flow')
    .action((id, { fresh }) => {
      if (!config.has('projects.current')) {
        return error('No project selected')
      }

      const { select, showList } = template(command, {
        createUrl,
        defaultData,
        getQuestions,
        success: (item) => successMessage(item, success),
      })

      return id ? select(id, fresh, error) : showList(fresh, error)
    })
}
