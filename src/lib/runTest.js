const chromeLauncher = require('chrome-launcher')
const CDP = require('chrome-remote-interface')
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

module.exports = async function (url, consoleTextPrefix = 'DEBUGGING: ') {
    try {
        if (!url) {
            throw new Error('No url received')
        }

        async function launchChrome () {
            return await chromeLauncher.launch({
                port: process.env.DEBUGGING_PORT,
                chromeFlags: [
                    '--headless',
                    '--disable-gpu',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                ]
            })
        }

        const chrome = await launchChrome()
        const protocol = await CDP({ port: chrome.port })

        const {
            DOM,
            Network,
            Page,
            Emulation,
            Runtime,
            Console
        } = protocol

        await Promise.all([Network.enable(), Page.enable(), DOM.enable(), Runtime.enable(), Console.enable()])

        const doneLogText = 'FINISHED'
        const fullUrl = `${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`

        await Page.navigate({ url: fullUrl })

        Console.messageAdded(({ level, text }) => {
            if (!text.startsWith(consoleTextPrefix)) {
                return
            }

            const message = text.replace(consoleTextPrefix, '')

            if (message === doneLogText) {
                protocol.close()
                return chrome.kill()
            }

            terminal[level](message)
        })
    } catch (error) {
        terminal.error(error)
    }
}
