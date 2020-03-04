
require('dotenv').config()

const DiscordBot = require('./discord-bot.js')
const TelegramBot = require('./telegram-bot.js')

const webMode = process.env.WEB_MODE
const port = process.env.PORT || 8080

const discordToken = process.env.DISCORD_BOT_TOKEN
const discordPrefix = process.env.DISCORD_BOT_CMD_PREFIX

const telegramToken = process.env.TELEGRAM_BOT_TOKEN

if(webMode == 'editor') {
    require('./web.js')
} else if(webMode == 'empty') {
    const app = require('express')()
    app.get('/', (req, res) => {
        res.send('')
    })
    app.listen(port)
}

if(discordToken) {
    const bot = new DiscordBot(discordToken, discordPrefix)
    bot.login()
}

if(telegramToken) {
    const bot = new TelegramBot(telegramToken)
    bot.launch()
}
