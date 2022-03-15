const puppeteer = require('puppeteer')
const colors = require('colors')
const spinner = require('ora')
const { apiUrl, debugPort, productionApiUrl } = require('./env')
const { error, success } = require('log-symbols')

const terminal = {
    lineFails (text) {
        this.error(text)
    },
    lineSuccess (text) {
        console.log(colors.green(success), colors.green(text))
    },
    scenarioStarts (text) {
        console.log('[SCENARIO]', text)
    },
    error (text) {
        console.log(colors.red(error), colors.red(text))
    },
    info (text) {
        console.log(colors.green(success), colors.green(text))
    },
    log (text) {
        console.log(text)
    },
    stats (passes, fails) {
        console.log('')
        console.log(
            colors.bgGreen.white.bold(` passes: ${passes} `),
            colors.bgRed.white.bold(` fails: ${fails} `)
        )
        console.log('')
    }
}

module.exports = (urls, consoleTextPrefix = '[CLI] ') => new Promise(async resolve => {
    const debuggingPort = debugPort()
    const isProduction = apiUrl() === productionApiUrl

    const args = [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]

    if (!isProduction) {
        args.push(`--remote-debugging-port=${debuggingPort}`)
        args.push('--remote-debugging-address=0.0.0.0')
    }

    const browser = await puppeteer.launch.call(puppeteer, { args })
    const doneLogText = 'FINISHED'
    const loader = spinner('Starting up')

    const shouldLog = urls.length === 1

    if (!isProduction) {
        console.log(`Remote debugging: http://localhost:${debuggingPort}`)
    }

    if (!shouldLog) {
        loader.start()
    }

    let done = urls.length

    const closeBrowser = () => {
        done--

        if (done) {
            return
        }

        loader.clear()
        loader.stop()

        browser.close()

        resolve()
    }

    urls.forEach(async url => {
        try {
            loader.start()

            const page = await browser.newPage()
            let passes = 0
            let fails = 0

            page.on('error', error => {
                if (shouldLog) {
                    terminal.info('on error')
                    terminal.error(error)
                }

                closeBrowser()
            })

            page.on('console', msg => {
                const type = msg.type()
                let text = msg.text()

                if (!text.startsWith(consoleTextPrefix)) {
                    return
                }

                text = text.replace(consoleTextPrefix, '').trim()

                if (text === doneLogText) {
                    if (shouldLog) {
                        loader.clear()
                        loader.stop()

                        if (passes || fails) {
                            terminal.stats(passes, fails)
                        }
                    }

                    if (fails || !passes) {
                        if (shouldLog && !passes) {
                            loader.fail('No action was taken')
                        }

                        process.exit(1)
                    }

                    return closeBrowser()
                }

                if (!terminal[type]) {
                    return
                }

                if (shouldLog) {
                    loader.clear()
                }

                if (type === 'info') {
                    if (text.startsWith('SCENARIO:')) {
                        if (shouldLog) {
                            console.log('')

                            terminal.scenarioStarts(text.replace('SCENARIO: ', ''))

                            console.log('')
                        }
                    } else {
                        passes++

                        if (shouldLog) {
                            loader.succeed(text)
                        }
                    }
                } else {
                    fails++

                    if (shouldLog) {
                        loader.fail(text)
                    }
                }

                if (shouldLog) {
                    loader.start('running')
                }
            })

            await page.goto(`${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`)
        } catch ({ message }) {
            if (shouldLog) {
                loader.clear()
                loader.stop()

                terminal.error(message)
            }

            closeBrowser()
        }
    })
})