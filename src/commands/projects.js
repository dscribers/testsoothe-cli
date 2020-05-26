const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')

const createUrl = (id) => {
  let url = '/projects'

  if (id) {
    url += `/${id}`
  } else {
    url += '?length=all'
  }

  return url
}

const defaultData = [
  {
    id: 1,
    name: 'Test Project 1',
  },
]

const getQuestions = (projects, current) => {
  return [
    {
      name: 'id',
      type: 'list',
      message: 'Select a project',
      default: current,
      choices: projects.map(({ id, name }) => ({
        name,
        short: name,
        value: id,
      })),
    },
  ]
}

const successMessage = (project, log) =>
  log(`Current project: <id: ${project.id}> ${project.name}`)

module.exports = (program, { error, success }) => {
  program
    .command('projects [id]')
    .option('-f --fresh', "creates a fresh projects' cache")
    .description('select a project')
    .action((id, { fresh }) => {
      const { select, showList } = template(command, {
        createUrl,
        defaultData,
        getQuestions,
        success: (project) => successMessage(project, success),
      })

      return id ? select(id, fresh, error) : showList(fresh, error)
    })
}
