const { loading, login, http } = require('../lib/server')
const config = require('../lib/config')
const inquirer = require('inquirer')
const clear = require('clear')

let configKey = null
let settings = {}

const showList = async (fresh, error) => {
  try {
    const items = await fetch(fresh)

    const current = config.get(`${configKey}.current`)

    const { id } = await inquirer.prompt(settings.getQuestions(items, current))

    await select(id, false, error)
  } catch (e) {
    return error(e.message)
  }
}

const select = async (id, fresh, error) => {
  try {
    const item = await fetch(fresh, id)

    config.set(`${configKey}.current`, item.id)

    clear()
    settings.success(item)
  } catch (e) {
    return error(e.message)
  }
}

const fetch = async (fresh = false, id) => {
  const storedItems = config.get(configKey)
  let items = (storedItems || {}).list || settings.defaultData || []

  if (!fresh) {
    if (id) {
      const single = items.find((project) => `${project.id}` === `${id}`)

      if (single) {
        return single
      }
    } else if (items.length) {
      return items
    }
  }

  const serverItems = await fetchFromServer(id)

  if (Array.isArray(serverItems)) {
    items = fresh ? serverItems : [...items, ...serverItems]
  } else {
    if (fresh) {
      const index = items.findIndex(({ id }) => id === serverItems.id)

      if (index > -1) {
        items.splice(index, 1, serverItems)
      } else {
        items.push(serverItems)
      }
    }
  }

  config.set(`${configKey}.list`, items)

  return id ? serverItems : items
}

const fetchFromServer = async (id) => {
  if (settings.auth !== false) {
    await login()
    clear()
  }

  let loader

  try {
    let message = `Fetching ${configKey}`

    if (id) {
      message += `(${id})`
    }

    loader = loading(message)

    const { data } = await http.get(settings.createUrl(id))

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
    'Function "createUrl" is required'
  )
  checkOK(
    typeof config.getQuestions === 'function',
    'Function "getQuestions" is required'
  )
  checkOK(
    typeof config.success === 'function',
    'Function "success" is required'
  )

  configKey = action
  settings = config

  return { showList, select }
}
