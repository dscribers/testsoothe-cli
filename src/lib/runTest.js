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
                chromeFlags: [
                    '--headless',
                    '--disable-gpu',
                    '--enable-automation',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                ],
                port: process.env.DEBUGGING_PORT,
                // logLevel: 'verbose'
            })
        }

        const chrome = await launchChrome()

        const protocol = await CDP({ port: chrome.port })

        const {
            DOM,
            Network,
            Page,
            Emulation,
            Runtime
        } = protocol

        await Promise.all([Network.enable(), Page.enable(), DOM.enable(), Runtime.enable()])

        const doneLogText = 'FINISHED'
        const fullUrl = `${url}&logPrefix=${encodeURIComponent(consoleTextPrefix)}&doneLogText=${encodeURIComponent(doneLogText)}`

        await Page.navigate({ url: fullUrl })

        Runtime.consoleAPICalled(({ type, args }) => {
            args.forEach(({ value }) => {
                if (!value.startsWith(consoleTextPrefix)) {
                    return
                }

                const text = value.replace(consoleTextPrefix, '')

                if (text === doneLogText) {
                    protocol.close()

                    return chrome.kill()
                }

                if (!terminal[type]) {
                    return
                }

                terminal[type](text)
            })
        })

        Page.loadEventFired()
    } catch (error) {
        terminal.error(error)
    }
}
