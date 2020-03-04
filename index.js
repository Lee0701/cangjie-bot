
require('dotenv').config()

const DiscordBot = require('./discord-bot.js')
const web = require('./web.js')

const bot = new DiscordBot()
bot.login()
