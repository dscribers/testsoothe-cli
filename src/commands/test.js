const config = require('../lib/config')
const runTest = require('../lib/runTest')
const prompt = require('../lib/prompt')
const { success } = require('../lib/logger')

module.exports = program => {
  program
    .command('test')
    .description('starts a test')
    .option('-p, --project <project_id>', 'run test on a project')
    .option('-f, --feature <feature_id>', 'run test on a feature')
    .option('-s, --scenario <scenario_id>', 'run test on a scenario')
    .option('-l, --flow <flow_id>', 'run test on a flow')
    .action(async ({ project, feature, scenario, flow }) => {
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

            return {
              name: `${type} [${label}]`,
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

      const runnerKey = config.get('auth.runner_key')
      const url = `${process.env.DOMAIN_URL}/view?action=runner&type=${type}&id=${id}&key=${runnerKey}&logs=1`

      success(`${type} [${id}]`, 'Starting runner')

      runTest(url)
    })
}
