const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')

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

const defaultData = [
  {
    id: 1,
    project_id: '1',
    title: 'Register',
    description: [
      {
        cmd: 'In order to',
        text: 'see the dashboard',
      },
      {
        cmd: 'As a',
        text: 'user',
      },
      {
        cmd: 'I need to',
        text: 'register',
      },
    ],
    gherkin:
      'Feature: Register\n\tIn order to see the dashboard\n\tAs a user\n\tI need to register',
    position: '0',
  },
]

const getQuestions = (features, current) => {
  return [
    {
      name: 'id',
      type: 'list',
      message: 'Select a feature',
      default: current,
      choices: features.map(({ id, title }) => ({
        name: title,
        short: title,
        value: id,
      })),
    },
  ]
}

const successMessage = (feature, log) => {
  config.delete('scenarios')
  log(`Current feature: <id: ${feature.id}> ${feature.title}`)
}

module.exports = (program, { error, success }) => {
  program
    .command('features [id]')
    .option('-f --fresh', "creates a fresh features' cache")
    .description('select a feature')
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
