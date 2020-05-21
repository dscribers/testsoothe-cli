const axios = require('axios')
const config = require('./config')

module.exports = axios.create({
  baseURL: 'http://backend.test/api',
  transformRequest: [
    (data, headers) => {
      if (config.has('auth.token')) {
        headers.Authorization = `Bearer ${config.get('auth.token')}`
      }

      return data
    },
    ...axios.defaults.transformRequest,
  ],
  transformResponse: [...axios.defaults.transformResponse, (data) => data.data],
  withCredentials: true,
})
