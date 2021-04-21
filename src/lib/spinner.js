const { Spinner } = require('clui')


module.exports = (message) => {
    return new Spinner(message)
}