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

module.exports = async (url, consoleTextPrefix = 'DEBUGGING: ') => {
    const browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
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
                protocol.close()

                return chrome.kill()
            }

            if (!terminal[type]) {
                return
            }

            terminal[type](text)
        })

        await page.goto(`${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`)
    } catch (error) {
        terminal.error(error)
    } finally {
        await browser.close()
    }
}