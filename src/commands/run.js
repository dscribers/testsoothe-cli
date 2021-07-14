const config = require('../lib/config')
const runTest = require('../lib/runTest')
const prompt = require('../lib/prompt')
const { domainUrl } = require('../lib/env')
const { error, success } = require('../lib/logger')

module.exports = program => {
  program
    .command('run')
    .description('runs the target')
    .option('-p, --project <project_id>', 'sets a project as the target')
    .option('-f, --feature <feature_id>', 'sets a feature as the target')
    .option('-s, --scenario <scenario_id>', 'sets a scenario as the target')
    .option('-l, --flow <flow_id>', 'sets a flow as the target')
    .option('-k, --runner-key <key>', 'sets the runner key')
    .action(async ({ project, feature, scenario, flow, runnerKey }) => {
      runnerKey = runnerKey || config.get('auth.runner_key')

      if (!runnerKey) {
        return error('Runner key not set')
      }

      let id, type

      if (project) {
        type = 'project'
        id = project
      } else if (feature) {
        type = 'feature'
        id = feature
      } else if (scenario) {
        type = 'scenario'
        id = scenario
      } else if (flow) {
        type = 'flow'
        id = flow
      } else {
        const choices = ['project', 'flow', 'feature', 'scenario']
          .filter((type) => config.has(`${type}s.current`))
          .map((type) => {
            const label = config.get(`${type}s.label`)
            const id = config.get(`${type}s.current`)

            return {
              name: `${type} (${label} [${id}])`,
              short: type,
              value: type,
            }
          })

        const { selectedType } = await prompt([
          {
            name: 'selectedType',
            type: 'list',
            message: 'What would you like to test?',
            choices,
          },
        ])

        if (!selectedType) {
          return
        }

        type = selectedType
        id = config.get(`${type}s.current`)
      }

      const url = `${domainUrl()}/view?action=runner&type=${type}&id=${id}&key=${runnerKey}&logs=1`

      success(`${type} [${id}]`, 'Starting runner')

      runTest(url)
    })
}
