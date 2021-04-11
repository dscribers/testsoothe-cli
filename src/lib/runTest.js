const puppeteer = require('puppeteer')
const colors = require('colors')

const terminal = {
    error (text) {
        console.log(colors.red(text))
    },
    info (text) {
        console.log(colors.blue(text))
    },
    log (text) {
        console.log(text)
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

        page.on('console', msg => {
            const type = msg.type()
            let text = msg.text()

            if (!text.startsWith(consoleTextPrefix)) {
                return
            }

            text = text.replace(consoleTextPrefix, '').trim()

            if (text === doneLogText) {
                return browser.close()
            }

            if (!terminal[type]) {
                return
            }

            terminal[type](text)
        })

        await page.goto(`${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`)
    } catch (error) {
        terminal.error(error)
        await browser.close()
    }
}