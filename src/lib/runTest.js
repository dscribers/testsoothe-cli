const chromeLauncher = require('chrome-launcher')
const CDP = require('chrome-remote-interface')
const colors = require('colors')

export const terminal = {
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

export default async function (url = 'https://example.com', consoleTextPrefix = 'DEBUGGING: ') {
    try {
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
        const protocol = await CDP({
            port: chrome.port
        })

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

        await Page.navigate({ url: `${url}&logPrefix=${consoleTextPrefix}&doneLogText=${doneLogText}` })

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
