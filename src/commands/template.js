const { login, http } = require('../lib/server')
const { error } = require('../lib/logger')
const config = require('../lib/config')
const prompt = require('../lib/prompt')
const clear = require('clear')
const spinner = require('ora')

let configKey = null
let settings = {}

const showList = async (fresh, error) => {
  try {
    const items = await fetch(fresh)

    if (!items.length) {
      return error(`No ${configKey} found`)
    }

    const current = config.get(`${configKey}.current`)

    const { id } = await prompt(settings.getQuestions(items, current))

    if (!id) {
      return
    }

    await select(id, false, error)
  } catch (e) {
    return error(e.message)
  }
}

const select = async (id, fresh, error) => {
  try {
    const item = await fetch(fresh, id)

    config.set(`${configKey}.current`, item.id)
    config.set(`${configKey}.label`, item[settings.labelKey])

    console.log()
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
  } else if (fresh) {
    const index = items.findIndex(({ id }) => id === serverItems.id)

    if (index > -1) {
      items.splice(index, 1, serverItems)
    } else {
      items.push(serverItems)
    }
  }

  config.set(`${configKey}.list`, items)

  return id ? serverItems : items
}

const fetchFromServer = async (id) => {
  if (settings.auth !== false) {
    const { email } = await login()

    if (!email) {
      return []
    }
  }

  let message = `Fetching ${configKey}`

  if (id) {
    message += `(${id})`
  }

  const loader = spinner(message).start()

  try {

    const url = settings.createUrl(id)
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
