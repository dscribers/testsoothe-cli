const inquirer = require('inquirer')
const { error } = require('./logger')

module.exports = async lines => {
    try {
        return inquirer.prompt(lines)
    } catch (e) {
        error(e.message)

        return {}
    }
}