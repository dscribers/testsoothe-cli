const env = (key, defaultValue) => {
    return process.env[key] || defaultValue
}

const PRODUCTION_URL = 'https://api.testsoothe.com/api'

module.exports = {
    appName: () => env('APP_NAME', 'TestSoothe'),
    apiUrl: () => env('API_URL', PRODUCTION_URL),
    debugPort: () => env('DEBUGGING_PORT', 9222),
    domainUrl: () => env('DOMAIN_URL', 'https://app.testsoothe.com/#'),
    productionUrl: PRODUCTION_URL
}