const env = (key, defaultValue) => {
    return process.env[key] || defaultValue
}


module.exports = {
    appName: () => env('APP_NAME', 'TestSoothe'),
    apiUrl: () => env('API_URL', 'https://api.testsoothe.com/api'),
    debugPort: () => env('DEBUGGING_PORT', 9222),
    domainUrl: () => env('DOMAIN_URL', 'https://app.testsoothe.com/#'),
}