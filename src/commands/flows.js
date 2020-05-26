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

const defaultData = [
  {
    id: 1,
    project_id: '1',
    name: 'et',
    scenarios: [1, 2],
  },
  {
    id: 2,
    project_id: '1',
    name: 'quibusdam',
    scenarios: [3, 4],
  },
  {
    id: 3,
    project_id: '1',
    name: 'recusandae',
    scenarios: [5, 6],
  },
]

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
