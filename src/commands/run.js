const config = require('../lib/config')
const runTest = require('../lib/runTest')
const prompt = require('../lib/prompt')
const { domainUrl } = require('../lib/env')
const { error, info, success } = require('../lib/logger')
const { cosmiconfigSync } = require('cosmiconfig')

const createUrl = (type, id, runnerKey, customUrl) => {
  const testUrl = `${domainUrl()}/view?action=runner&type=${type}&id=${id}&key=${runnerKey}&logs=1`

  if (customUrl) {
    return `${testUrl}&url=${customUrl}`
  }

  return testUrl
}

const getRunnerOptions = async () => {
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
    return {}
  }

  return { id, type: selectedType }
}

module.exports = program => {
  program
    .command('run')
    .description('runs the target')
    .option('-p, --project <project_id>', 'sets a project as the target')
    .option('-f, --feature <feature_id>', 'sets a feature as the target')
    .option('-s, --scenario <scenario_id>', 'sets a scenario as the target')
    .option('-l, --flow <flow_id>', 'sets a flow as the target')
    .option('-k, --runner-key <key>', 'sets the runner key')
    .option('-u, --url <url>', 'sets the url to run the test against')
    .option('-c, --config-file <config_file>', 'sets the path to the config file to use')
    .action(async ({ configFile, project, feature, scenario, flow, runnerKey, url }) => {
      const runnerConfig = {
        parallel: true,
        tests: []
      }

      const explorerSync = cosmiconfigSync('testsoothe')
      let result = null

      if (configFile) {
        info(`Loading config file at ${configFile}`)

        result = explorerSync.load(configFile)
      } else {
        info(`Searching for config file`)

        result = explorerSync.search()

        if (result) {
          info(`Found config at ${result.filepath}`)
        }
      }

      if (result && !result.isEmpty) {
        Object.assign(runnerConfig, result.config)
      }

      runnerKey = runnerKey || runnerConfig.runnerKey || config.get('auth.runner_key')

      if (!runnerKey) {
        return error('Runner key not set')
      }

      let id, type, testUrls = []

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
      } else if ((runnerConfig.tests || []).length) {
        runnerConfig.tests.forEach(({ id, type, customUrl }) => testUrls.push(createUrl(type, id, runnerKey, customUrl)))
      } else {
        const options = getRunnerOptions()

        if (!options.type) {
          return
        }

        type = options.type
        id = config.get(`${type}s.current`)
      }

      if (!testUrls.length) {
        testUrls.push(createUrl(type, id, runnerKey, url))
        success(`${type} [${id}]`, 'Starting runner')
      }

      try {
        if (testUrls.length > 1 && !runnerConfig.parallel) {
          while (testUrls.length) {
            await runTest([testUrls.shift()])
          }
        } else {
          await runTest(testUrls)
        }
      } catch (e) {
        error(e.message)
      }
    })
}
