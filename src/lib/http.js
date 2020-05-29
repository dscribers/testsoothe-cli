const axios = require('axios')
const config = require('./config')

const Http = require('@ezraobiwale/http/dist/http')

module.exports = new Http({
  baseURL: 'https://testsuiteapi-sprint.apps.dscribe.tech/api',
  transformRequest: [
    (data, headers) => {
      if (config.has('auth.token')) {
        headers.Authorization = `Bearer ${config.get('auth.token')}`
      }

      return data
    },
    ...axios.defaults.transformRequest,
  ],
  withCredentials: true,
})
