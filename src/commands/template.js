const { loading, login, http } = require('../lib/server')
const config = require('../lib/config')
const inquirer = require('inquirer')
const clear = require('clear')

let configKey = null
let settings = {}

const showList = async (fresh, error) => {
  try {
    const items = await fetch(fresh)

    if (!items.length) {
      return error(`No ${configKey} found`)
    }

    const current = config.get(`${configKey}.current`)

    const { pid } = await inquirer.prompt(settings.getQuestions(items, current))

    await select(pid, false, error)
  } catch (e) {
    return error(e.message)
  }
}

const select = async (pid, fresh, error) => {
  try {
    const item = await fetch(fresh, pid)

    config.set(`${configKey}.current`, item.pid)
    config.set(`${configKey}.label`, item[settings.labelKey])

    console.log()
    settings.success(item)
  } catch (e) {
    return error(e.message)
  }
}

const fetch = async (fresh = false, pid) => {
  const storedItems = config.get(configKey)
  let items = (storedItems || {}).list || settings.defaultData || []

  if (!fresh) {
    if (pid) {
      const single = items.find((project) => `${project.pid}` === `${pid}`)

      if (single) {
        return single
      }
    } else if (items.length) {
      return items
    }
  }

  const serverItems = await fetchFromServer(pid)

  if (Array.isArray(serverItems)) {
    items = fresh ? serverItems : [...items, ...serverItems]
  } else {
    if (fresh) {
      const index = items.findIndex(({ pid }) => pid === serverItems.pid)

      if (index > -1) {
        items.splice(index, 1, serverItems)
      } else {
        items.push(serverItems)
      }
    }
  }

  config.set(`${configKey}.list`, items)

  return pid ? serverItems : items
}

const fetchFromServer = async (pid) => {
  if (settings.auth !== false) {
    await login()
    console.log
  }

  let loader

  try {
    let message = `Fetching ${configKey}`

    if (pid) {
      message += `(${pid})`
    }

    loader = loading(message)

    const url = settings.createUrl(pid)
    const { data } = await http.get(url)

    return data
  } finally {
    loader.stop()
  }
}

const checkOK = (value, errorMessage) => {
  if (!value) {
    throw new Error(errorMessage)
  }
}

module.exports = (action, config) => {
  checkOK(action, 'Action is required')
  checkOK(
    typeof config.createUrl === 'function',
    'Config "createUrl" (function) is required'
  )
  checkOK(
    typeof config.getQuestions === 'function',
    'Config "getQuestions" (function) is required'
  )
  checkOK(
    typeof config.labelKey === 'string' && !!config.labelKey.trim(),
    'Config "labelKey" (string) is required'
  )
  checkOK(
    typeof config.success === 'function',
    'Config "success" (function) is required'
  )

  configKey = action
  settings = config

  return { showList, select }
}
