require('dotenv').config()

const env = (key, defaultValue) => {
    return process.env[key] || defaultValue
}

const PRODUCTION_URL = 'https://app.testsoothe.com/#'
const PRODUCTION_API_URL = 'https://api.testsoothe.com/api'

module.exports = {
    appName: () => env('TESTSOOTHE_APP_NAME', 'TestSoothe'),
    apiUrl: () => env('TESTSOOTHE_API_URL', PRODUCTION_API_URL),
    debugPort: () => env('TESTSOOTHE_DEBUGGING_PORT', 9222),
    domainUrl: () => env('TESTSOOTHE_DOMAIN_URL', PRODUCTION_URL),
    productionApiUrl: PRODUCTION_API_URL
}