
require('dotenv').config()

const DiscordBot = require('./discord-bot.js')

const bot = new DiscordBot()
bot.login()
