const puppeteer = require('puppeteer')
const colors = require('colors')
const spinner = require('./spinner')
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
            colors.bgWhite.black.bold(` TOTAL: ${passes + fails} `),
            colors.bgGreen.white.bold(` PASSES: ${passes} `),
            colors.bgRed.white.bold(` FAILS: ${fails} `)
        )
    }
}

module.exports = async (url, consoleTextPrefix = '[CLI] ') => {
    const browser = await puppeteer.launch({
        args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--remote-debugging-port=${process.env.DEBUGGING_PORT || 9222}`,
            '--remote-debugging-address=0.0.0.0',
        ]
    })
    const doneLogText = 'FINISHED'

    try {
        if (!url) {
            throw new Error('No url received')
        }

        const page = await browser.newPage()
        const loader = spinner('')
        let passes = 0
        let fails = 0

        loader.start()

        page.on('console', msg => {
            const type = msg.type()
            let text = msg.text()

            if (!text.startsWith(consoleTextPrefix)) {
                return
            }

            text = text.replace(consoleTextPrefix, '').trim()

            loader.stop()

            if (text === doneLogText) {
                terminal.stats(passes, fails)

                return browser.close()
            }

            if (!terminal[type]) {
                return
            }

            if (type === 'info') {
                if (text.startsWith('SCENARIO:')) {
                    console.log('')

                    terminal.scenarioStarts(text.replace('SCENARIO: ', ''))

                    console.log('')
                } else {
                    passes++
                    terminal.lineSuccess(text)
                }
            } else {
                fails++
                terminal.lineFails(text)
            }

            loader.start()
        })

        await page.goto(`${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`)
    } catch (error) {
        terminal.error(error)
        await browser.close()
    }
}