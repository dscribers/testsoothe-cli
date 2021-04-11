const colors = require('colors')

module.exports.error = message => {
    console.log(colors.red(message))
}

module.exports.info = message => {
    console.log(colors.blue(message))
}

module.exports.success = (message, title) => {
    let fullMessage = ''

    if (title) {
        fullMessage = `${title}: `
    }

    fullMessage += colors.green(message)

    console.log(fullMessage)
}