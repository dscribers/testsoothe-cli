const axios = require('axios')
const config = require('./config')
const { apiUrl } = require('./env')

const Http = require('@ezraobiwale/http')

module.exports = new Http({
  baseURL: apiUrl(),
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
