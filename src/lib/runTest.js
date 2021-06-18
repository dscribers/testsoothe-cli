const puppeteer = require('puppeteer')
const colors = require('colors')
const spinner = require('ora')
const { debugPort } = require('./env')
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

module.exports = async (url, consoleTextPrefix = '[CLI] ') => {
    const browser = await puppeteer.launch.call(puppeteer, {
        args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--remote-debugging-port=${debugPort()}`,
            '--remote-debugging-address=0.0.0.0',
        ]
    })
    const doneLogText = 'FINISHED'
    const loader = spinner('Starting up')

    try {
        if (!url) {
            throw new Error('No url received')
        }

        console.log(`Remote debugging: http://localhost:${debugPort()}`)
        // console.log(`${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`)
        loader.start()

        const page = await browser.newPage()
        let passes = 0
        let fails = 0

        page.on('error', error => {
            terminal.info('on error')
            terminal.error(error)

            browser.close()
        })

        page.on('console', msg => {
            const type = msg.type()
            let text = msg.text()

            if (!text.startsWith(consoleTextPrefix)) {
                return
            }

            text = text.replace(consoleTextPrefix, '').trim()

            if (text === doneLogText) {
                loader.clear()
                loader.stop()

                terminal.stats(passes, fails)
                return browser.close()
            }

            if (!terminal[type]) {
                return
            }

            loader.clear()

            if (type === 'info') {
                if (text.startsWith('SCENARIO:')) {
                    console.log('')

                    terminal.scenarioStarts(text.replace('SCENARIO: ', ''))

                    console.log('')
                } else {
                    passes++
                    loader.succeed(text)
                }
            } else {
                fails++
                loader.fail(text)
            }

            loader.start('running')
        })

        await page.goto(`${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`)
    } catch ({ message }) {
        loader.clear()
        loader.stop()

        terminal.error(message)
        browser.close()
    }
}