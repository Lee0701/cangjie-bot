
require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')

const token = process.env.BOT_TOKEN
const prefix = process.env.CMD_PREFIX || '!'

const client = new Discord.Client()
client.commands = new Discord.Collection()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

fs.readdirSync('./commands').filter(file => file.endsWith('.js')).forEach(file => {
    const command = require('./commands/' + file)
    client.commands.set(command.name, command)
})

client.on('message', (msg) => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return

    const args = msg.content.slice(prefix.length).split(/ +/)
    const cmd = args.shift().toLowerCase()

    if(cmd === 'cangjie') {
        client.commands.get('cangjie').execute(msg, args)
    }

})

client.login(token)
