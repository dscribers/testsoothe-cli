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

const defaultData = [
  {
    id: 1,
    feature_id: '1',
    title: 'Register - Success',
    lines: [
      {
        cmd: 'When',
        sub_cmd: 'I go to',
        text: '__registration_url__',
      },
      {
        cmd: 'And',
        sub_cmd: 'in',
        text: '__email__',
        selector: 'inputEmail',
      },
      {
        cmd: 'And',
        sub_cmd: 'in',
        text: '__password__',
        selector: 'inputPassword',
      },
      {
        cmd: 'And',
        sub_cmd: 'I submit form',
        selector: 'form',
      },
      {
        cmd: 'And',
        sub_cmd: 'I wait till page loads',
      },
      {
        cmd: 'Then',
        sub_cmd: 'I should be on',
        text: '__login_url__?registered=1',
      },
      {
        cmd: 'And',
        sub_cmd: 'should contain',
        text: 'Registration successful',
      },
    ],
    gherkin:
      'Scenario: Register - Success\n\tWhen I go to "__registration_url__"\n\tAnd I type "__email__" in "inputEmail"\n\tAnd I type "__password__" in "inputPassword"\n\tAnd I submit form "form"\n\tAnd I wait till page loads\n\tThen I should be on "__login_url__?registered=1"\n\tAnd page should contain "Registration successful"',
    position: '0',
    parsed_gherkin:
      'Scenario: Register - Success\n\tWhen I go to "http://localhost/dstest/register.html"\n\tAnd I type "ezra@mail.com" in "inputEmail"\n\tAnd I type "pass" in "inputPassword"\n\tAnd I submit form "form"\n\tAnd I wait till page loads\n\tThen I should be on "http://localhost/dstest/login.html?registered=1"\n\tAnd page should contain "Registration successful"',
  },
]

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
  log(`Current scenario: <id: ${scenario.id}> ${scenario.title}`)

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
        success: (item) => successMessage(item, success),
      })

      return id ? select(id, fresh, error) : showList(fresh, error)
    })
}
