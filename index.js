
require('dotenv').config()

const DiscordBot = require('./discord-bot.js')
const TelegramBot = require('./telegram-bot.js')
const web = require('./web.js')

const discordToken = process.env.DISCORD_BOT_TOKEN
const discordPrefix = process.env.DISCORD_BOT_CMD_PREFIX

const telegramToken = process.env.TELEGRAM_BOT_TOKEN

if(discordToken) {
    const bot = new DiscordBot(discordToken, discordPrefix)
    bot.login()
}

if(telegramToken) {
    const bot = new TelegramBot(telegramToken)
    bot.launch()
}
