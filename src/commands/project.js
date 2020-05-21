const server = require('../lib/server')
const config = require('../lib/config')
const inquirer = require('inquirer')
const clear = require('clear')

const showList = async (override, { error, success }) => {
  try {
    const data = await fetch(override)

    const currentProject = config.get('projects.current')

    const { id } = await inquirer.prompt([
      {
        name: 'id',
        type: 'list',
        message: 'Select a project',
        default: currentProject,
        choices: data.map(({ id, name }) => ({ name, short: name, value: id })),
      },
    ])

    await select(id, override, { error, success })
  } catch (e) {
    return error(e.message)
  }
}

const select = async (id, override, { error, success }) => {
  try {
    const project = await fetch(override, id)

    config.set('projects.current', project.id)

    clear()
    success(`Current project: <id: ${project.id}> ${project.name}`)
  } catch (e) {
    return error(e.message)
  }
}

const fetch = async (override = false, id) => {
  const projects = config.get('projects')
  let data = (projects || {}).list || []

  data = [
    {
      id: 1,
      name: 'Test Project 1',
    },
    {
      id: 2,
      name: 'Test Project 2',
    },
  ]

  if (!override) {
    if (id) {
      const single = data.find((project) => project.id === id)

      if (single) {
        return single
      }
    } else if (data.length) {
      return data
    }
  }

  const serverData = await fetchFromServer(id)

  if (Array.isArray(serverData)) {
    data = override ? serverData : [...data, ...serverData]
  } else {
    if (override) {
      const index = data.findIndex(({ id }) => id === serverData.id)

      if (index > -1) {
        data.splice(index, 1, serverData)
      } else {
        data.push(serverData)
      }
    }
  }

  config.set('projects.list', data)

  return id ? serverData : data
}

const fetchFromServer = async (id) => {
  server.login()

  let url = '/projects'

  if (id) {
    url += `/${id}`
  } else {
    url += '?length=all'
  }

  const { data } = await server.request.get(url)

  return data
}

module.exports = (program, logger) => {
  program
    .command('project [id]')
    .option('-f --force', 'clears cache and reloads project')
    .description('select a project')
    .action((id, { force }) =>
      id ? select(id, force, logger) : showList(force, logger)
    )
}
