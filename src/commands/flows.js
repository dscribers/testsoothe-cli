const path = require('path')
const command = path.basename(__filename, '.js')
const template = require('./template')
const config = require('../lib/config')

const createUrl = (pid) => {
  let url

  if (pid) {
    url = `/project-flows/${pid}`
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
      name: 'pid',
      type: 'list',
      message: 'Select a project flow',
      default: current,
      choices: flows.map(({ pid, name }) => ({
        name: `${name} [${pid}]`,
        short: pid,
        value: pid,
      })),
    },
  ]
}

const successMessage = ({ name, pid }, log) => log(`${name} [${pid}]`, `Current project flow`)

module.exports = (program, { error, success }) => {
  program
    .command('flows [id]')
    .option('-f --fresh', "creates a fresh flows' cache")
    .description('select a flow')
    .action((pid, { fresh }) => {
      if (!config.has('projects.current')) {
        return error('No project selected')
      }

      const { select, showList } = template(command, {
        createUrl,
        defaultData,
        getQuestions,
        labelKey: 'name',
        success: (item) => successMessage(item, success),
      })

      return pid ? select(pid, fresh, error) : showList(fresh, error)
    })
}
